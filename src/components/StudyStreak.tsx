import { motion } from "framer-motion";
import { Flame } from "lucide-react";

interface StudyStreakProps {
  streak: number;
}

export function StudyStreak({ streak }: StudyStreakProps) {
  const showFlame = streak >= 3;

  return (
    <div className="glass-card-hover p-5 flex items-center gap-4">
      <div className="relative">
        <motion.div
          animate={showFlame ? { scale: [1, 1.2, 1], rotate: [0, -5, 5, 0] } : {}}
          transition={{ duration: 0.8, repeat: Infinity, repeatType: "loop" }}
        >
          <Flame
            className={`h-10 w-10 ${showFlame ? "text-warning drop-shadow-[0_0_12px_hsl(38,92%,50%)]" : "text-muted-foreground"}`}
          />
        </motion.div>
        {showFlame && (
          <motion.div
            className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-warning"
            animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
        )}
      </div>
      <div>
        <p className="text-2xl font-display font-bold">
          🔥 {streak}-Day Streak
        </p>
        <p className="text-xs text-muted-foreground">
          {streak === 0
            ? "Study today to start your streak!"
            : streak < 3
            ? "Keep going!"
            : streak < 7
            ? "You're on fire! 🔥"
            : "Incredible consistency! 🏆"}
        </p>
      </div>
    </div>
  );
}

export function calculateStreak(sessionDates: string[]): number {
  if (sessionDates.length === 0) return 0;

  const uniqueDays = [...new Set(sessionDates.map((d) => d.split("T")[0]))].sort().reverse();
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  if (uniqueDays[0] !== today && uniqueDays[0] !== yesterday) return 0;

  let streak = 0;
  let checkDate = new Date(uniqueDays[0]);

  for (const day of uniqueDays) {
    const expected = checkDate.toISOString().split("T")[0];
    if (day === expected) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (day < expected) {
      break;
    }
  }

  return streak;
}
