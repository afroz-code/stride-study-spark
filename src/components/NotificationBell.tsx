import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTasks } from "@/hooks/useTasks";
import { useStudySessions } from "@/hooks/useStudySessions";
import { calculateStreak } from "@/components/StudyStreak";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Notification {
  id: string;
  message: string;
  type: "warning" | "info" | "success";
  icon: string;
}

export function NotificationBell() {
  const { data: tasks } = useTasks();
  const { data: sessions } = useStudySessions();
  const [open, setOpen] = useState(false);

  const notifications: Notification[] = [];
  const todayStr = new Date().toISOString().split("T")[0];

  // Overdue tasks
  const overdueTasks = tasks?.filter(
    (t) => t.deadline && t.deadline < todayStr && t.status !== "completed"
  );
  if (overdueTasks && overdueTasks.length > 0) {
    notifications.push({
      id: "overdue",
      message: `You have ${overdueTasks.length} overdue task${overdueTasks.length > 1 ? "s" : ""}`,
      type: "warning",
      icon: "⚠️",
    });
  }

  // No study today
  const todaySessions = sessions?.filter((s) => s.started_at.startsWith(todayStr));
  if (!todaySessions || todaySessions.length === 0) {
    notifications.push({
      id: "no-study",
      message: "You haven't studied today. Start a focus session!",
      type: "info",
      icon: "📚",
    });
  }

  // Streak warning
  const streak = calculateStreak(sessions?.map((s) => s.started_at) ?? []);
  if (streak >= 3) {
    notifications.push({
      id: "streak",
      message: `🔥 ${streak}-day streak! Don't break it today.`,
      type: "success",
      icon: "🔥",
    });
  }

  // Pending high-priority tasks
  const highPriority = tasks?.filter(
    (t) => t.priority === "high" && t.status !== "completed"
  );
  if (highPriority && highPriority.length > 0) {
    notifications.push({
      id: "high-priority",
      message: `${highPriority.length} high-priority task${highPriority.length > 1 ? "s" : ""} pending`,
      type: "warning",
      icon: "🔴",
    });
  }

  const typeColors = {
    warning: "border-l-warning",
    info: "border-l-info",
    success: "border-l-success",
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative p-2 rounded-lg hover:bg-secondary/60 transition-colors">
          <Bell className="h-5 w-5 text-muted-foreground" />
          {notifications.length > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-[10px] font-bold flex items-center justify-center text-destructive-foreground"
            >
              {notifications.length}
            </motion.span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 glass-card border-border/50" align="end">
        <div className="p-3 border-b border-border/30">
          <h4 className="font-display font-semibold text-sm">Notifications</h4>
        </div>
        <div className="max-h-64 overflow-auto">
          {notifications.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground text-center">All caught up! 🎉</p>
          ) : (
            <AnimatePresence>
              {notifications.map((n, i) => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`p-3 border-l-2 ${typeColors[n.type]} border-b border-border/20 last:border-b-0`}
                >
                  <p className="text-xs text-foreground">
                    <span className="mr-1.5">{n.icon}</span>
                    {n.message}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
