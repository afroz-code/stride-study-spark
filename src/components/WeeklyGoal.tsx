import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Target, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface WeeklyGoalProps {
  currentHours: number;
}

export function WeeklyGoal({ currentHours }: WeeklyGoalProps) {
  const [goalHours, setGoalHours] = useState(10);
  const [editing, setEditing] = useState(false);
  const [tempGoal, setTempGoal] = useState("10");

  useEffect(() => {
    const saved = localStorage.getItem("weekly-study-goal");
    if (saved) setGoalHours(Number(saved));
  }, []);

  const saveGoal = () => {
    const val = Math.max(1, Number(tempGoal) || 10);
    setGoalHours(val);
    localStorage.setItem("weekly-study-goal", String(val));
    setEditing(false);
  };

  const progress = Math.min(100, Math.round((currentHours / goalHours) * 100));
  const completed = progress >= 100;

  return (
    <div className="glass-card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className={`h-5 w-5 ${completed ? "text-success" : "text-primary"}`} />
          <span className="text-sm font-medium">Weekly Study Goal</span>
        </div>
        {!editing ? (
          <button
            onClick={() => { setTempGoal(String(goalHours)); setEditing(true); }}
            className="text-xs text-primary hover:underline"
          >
            Edit
          </button>
        ) : (
          <div className="flex items-center gap-1">
            <Input
              type="number"
              value={tempGoal}
              onChange={(e) => setTempGoal(e.target.value)}
              className="h-7 w-16 text-xs bg-secondary/50 border-border/50"
              min="1"
            />
            <span className="text-xs text-muted-foreground">hrs</span>
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={saveGoal}>
              <Check className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>

      <div className="relative h-3 bg-secondary rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${completed ? "bg-success" : "bg-primary"}`}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{currentHours.toFixed(1)}h / {goalHours}h</span>
        <span className={completed ? "text-success font-semibold" : ""}>
          {completed ? "✅ Goal Reached!" : `${progress}% complete`}
        </span>
      </div>
    </div>
  );
}
