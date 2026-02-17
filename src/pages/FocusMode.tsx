import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useCreateStudySession, useStudySessions } from "@/hooks/useStudySessions";
import { useToast } from "@/hooks/use-toast";
import { Play, Pause, Square, Timer, Clock, RotateCcw } from "lucide-react";

export default function FocusMode() {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionType, setSessionType] = useState<"freeform" | "pomodoro">("freeform");
  const [pomodoroMinutes, setPomodoroMinutes] = useState(25);
  const startTimeRef = useRef<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const createSession = useCreateStudySession();
  const { data: sessions } = useStudySessions();
  const { toast } = useToast();

  const targetSeconds = sessionType === "pomodoro" ? pomodoroMinutes * 60 : Infinity;

  const start = () => {
    if (!isRunning) {
      startTimeRef.current = new Date().toISOString();
      setIsRunning(true);
    }
  };

  const pause = () => setIsRunning(false);

  const stop = useCallback(() => {
    setIsRunning(false);
    if (seconds >= 60 && startTimeRef.current) {
      createSession.mutate(
        {
          duration_minutes: Math.round(seconds / 60),
          session_type: sessionType,
          started_at: startTimeRef.current,
        },
        {
          onSuccess: () => toast({ title: "Session saved!", description: `${Math.round(seconds / 60)} minutes recorded.` }),
        }
      );
    }
    setSeconds(0);
    startTimeRef.current = null;
  }, [seconds, sessionType, createSession, toast]);

  const reset = () => {
    setIsRunning(false);
    setSeconds(0);
    startTimeRef.current = null;
  };

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          if (sessionType === "pomodoro" && s + 1 >= targetSeconds) {
            stop();
            return 0;
          }
          return s + 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, sessionType, targetSeconds, stop]);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const progress = sessionType === "pomodoro" ? (seconds / targetSeconds) * 100 : 0;
  const todayStr = new Date().toISOString().split("T")[0];
  const todayMinutes = sessions?.filter((s) => s.started_at.startsWith(todayStr)).reduce((a, s) => a + s.duration_minutes, 0) ?? 0;
  const weekMinutes = sessions?.reduce((a, s) => a + s.duration_minutes, 0) ?? 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold">Focus Mode</h1>
        <p className="text-muted-foreground text-sm mt-1">Minimize distractions and track your study time</p>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2">
        <Button
          variant={sessionType === "freeform" ? "default" : "outline"}
          onClick={() => { setSessionType("freeform"); reset(); }}
          className="gap-2"
        >
          <Timer className="h-4 w-4" /> Freeform
        </Button>
        <Button
          variant={sessionType === "pomodoro" ? "default" : "outline"}
          onClick={() => { setSessionType("pomodoro"); reset(); }}
          className="gap-2"
        >
          <Clock className="h-4 w-4" /> Pomodoro
        </Button>
      </div>

      {sessionType === "pomodoro" && (
        <div className="flex gap-2">
          {[15, 25, 45, 60].map((m) => (
            <Button
              key={m}
              variant={pomodoroMinutes === m ? "secondary" : "ghost"}
              size="sm"
              onClick={() => { setPomodoroMinutes(m); reset(); }}
            >
              {m}m
            </Button>
          ))}
        </div>
      )}

      {/* Timer Display */}
      <div className="glass-card p-12 text-center relative overflow-hidden">
        {sessionType === "pomodoro" && (
          <div
            className="absolute bottom-0 left-0 h-1 bg-primary transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        )}
        <motion.p
          key={seconds}
          className="text-7xl md:text-8xl font-display font-bold tabular-nums tracking-tight"
          initial={false}
        >
          {sessionType === "pomodoro" ? formatTime(targetSeconds - seconds) : formatTime(seconds)}
        </motion.p>
        <p className="text-muted-foreground mt-4 text-sm">
          {isRunning ? "Stay focused..." : seconds > 0 ? "Paused" : "Ready to start"}
        </p>
        <div className="flex items-center justify-center gap-3 mt-8">
          {!isRunning ? (
            <Button size="lg" onClick={start} className="gap-2 px-8">
              <Play className="h-5 w-5" /> {seconds > 0 ? "Resume" : "Start"}
            </Button>
          ) : (
            <Button size="lg" variant="outline" onClick={pause} className="gap-2 px-8">
              <Pause className="h-5 w-5" /> Pause
            </Button>
          )}
          {seconds > 0 && (
            <>
              <Button size="lg" variant="destructive" onClick={stop} className="gap-2">
                <Square className="h-4 w-4" /> Stop & Save
              </Button>
              <Button size="lg" variant="ghost" onClick={reset}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card p-5 text-center">
          <p className="text-2xl font-display font-bold">{(todayMinutes / 60).toFixed(1)}h</p>
          <p className="text-xs text-muted-foreground mt-1">Today's Study Time</p>
        </div>
        <div className="glass-card p-5 text-center">
          <p className="text-2xl font-display font-bold">{(weekMinutes / 60).toFixed(1)}h</p>
          <p className="text-xs text-muted-foreground mt-1">Total Study Time</p>
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="glass-card p-6">
        <h3 className="font-display font-semibold mb-4">Recent Sessions</h3>
        <div className="space-y-2 max-h-48 overflow-auto">
          {sessions?.slice(0, 10).map((s) => (
            <div key={s.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
              <span className="text-sm">{new Date(s.started_at).toLocaleDateString()} at {new Date(s.started_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
              <div className="flex items-center gap-2">
                <Badge className="text-xs" variant="outline">{s.session_type}</Badge>
                <span className="text-sm font-medium">{s.duration_minutes}m</span>
              </div>
            </div>
          )) ?? <p className="text-muted-foreground text-sm">No sessions yet</p>}
        </div>
      </div>
    </motion.div>
  );
}

function Badge({ children, className, variant }: { children: React.ReactNode; className?: string; variant?: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${variant === "outline" ? "border-border/50" : "bg-primary/20 border-primary/30"} ${className}`}>
      {children}
    </span>
  );
}
