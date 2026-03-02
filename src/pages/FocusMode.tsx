import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCreateStudySession, useStudySessions } from "@/hooks/useStudySessions";
import { useToast } from "@/hooks/use-toast";
import { Play, Pause, Square, Brain, Repeat, RotateCcw } from "lucide-react";

const modes = [
  {
    key: "freeform" as const,
    label: "Deep Focus",
    icon: Brain,
    description: "Unlimited distraction-free study session.",
  },
  {
    key: "pomodoro" as const,
    label: "Focus Cycles",
    icon: Repeat,
    description: "Structured 25-minute focus sessions with short breaks.",
  },
];

export default function FocusMode() {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionType, setSessionType] = useState<"freeform" | "pomodoro">("freeform");
  const [pomodoroMinutes, setPomodoroMinutes] = useState(25);
  const [cycleCount, setCycleCount] = useState(1);
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
    setCycleCount(1);
    startTimeRef.current = null;
  };

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          if (sessionType === "pomodoro" && s + 1 >= targetSeconds) {
            if (cycleCount < 4) {
              setCycleCount((c) => c + 1);
              toast({ title: `Cycle ${cycleCount} complete!`, description: "Take a 5 minute break." });
              return 0;
            }
            stop();
            return 0;
          }
          return s + 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, sessionType, targetSeconds, stop, cycleCount, toast]);

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

  const activeMode = modes.find((m) => m.key === sessionType)!;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold">Focus Mode</h1>
        <p className="text-muted-foreground text-sm mt-1">Minimize distractions and track your study time</p>
      </div>

      {/* Mode Selector */}
      <div className="grid grid-cols-2 gap-3">
        {modes.map((mode) => {
          const isActive = sessionType === mode.key;
          return (
            <button
              key={mode.key}
              onClick={() => { setSessionType(mode.key); reset(); }}
              className={`relative p-4 rounded-xl border text-left transition-all duration-300 group
                ${isActive
                  ? "border-primary/60 bg-primary/10 shadow-[0_0_20px_hsl(250_80%_65%/0.15)] scale-[1.02]"
                  : "border-border/50 bg-card/60 hover:border-primary/30 hover:bg-card/80 hover:scale-[1.01]"
                }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <mode.icon className={`h-4 w-4 transition-colors ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary/70"}`} />
                <span className={`font-display font-semibold text-sm ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                  {mode.label}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{mode.description}</p>
            </button>
          );
        })}
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

        {/* Active Mode Label */}
        <AnimatePresence mode="wait">
          <motion.div
            key={sessionType}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.3 }}
            className="mb-4"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
              <activeMode.icon className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium text-primary">{activeMode.label} Active</span>
            </div>
          </motion.div>
        </AnimatePresence>

        <motion.p
          key={seconds}
          className="text-7xl md:text-8xl font-display font-bold tabular-nums tracking-tight"
          initial={false}
        >
          {sessionType === "pomodoro" ? formatTime(targetSeconds - seconds) : formatTime(seconds)}
        </motion.p>

        {/* Pomodoro helper text */}
        {sessionType === "pomodoro" && (
          <div className="mt-3 space-y-1">
            <p className="text-xs text-muted-foreground">{pomodoroMinutes} min Focus • 5 min Break</p>
            <p className="text-xs text-primary/70 font-medium">Cycle {cycleCount} of 4</p>
          </div>
        )}

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
                <Badge variant="outline" className="text-xs">
                  {s.session_type === "freeform" ? "Deep Focus" : "Focus Cycle"}
                </Badge>
                <span className="text-sm font-medium">{s.duration_minutes}m</span>
              </div>
            </div>
          )) ?? <p className="text-muted-foreground text-sm">No sessions yet</p>}
        </div>
      </div>
    </motion.div>
  );
}
