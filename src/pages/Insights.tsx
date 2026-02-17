import { motion } from "framer-motion";
import { useTasks } from "@/hooks/useTasks";
import { useStudySessions } from "@/hooks/useStudySessions";
import { Lightbulb, TrendingUp, TrendingDown, Clock, Star, AlertTriangle } from "lucide-react";

interface Insight {
  icon: React.ElementType;
  title: string;
  description: string;
  type: "positive" | "warning" | "tip";
}

export default function Insights() {
  const { data: tasks } = useTasks();
  const { data: sessions } = useStudySessions();

  const insights: Insight[] = [];

  // Analyze study sessions by hour
  if (sessions && sessions.length > 0) {
    const hourCounts: Record<number, number> = {};
    sessions.forEach((s) => {
      const hour = new Date(s.started_at).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + s.duration_minutes;
    });
    const peakHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];
    if (peakHour) {
      const h = parseInt(peakHour[0]);
      const period = h < 12 ? "morning" : h < 17 ? "afternoon" : "evening";
      insights.push({
        icon: Star,
        title: `You're most productive in the ${period}`,
        description: `Your peak study time is around ${h > 12 ? h - 12 : h}:00 ${h >= 12 ? "PM" : "AM"}. Schedule important tasks during this time for best results.`,
        type: "positive",
      });
    }

    // Check for late-night sessions
    const lateMinutes = sessions
      .filter((s) => new Date(s.started_at).getHours() >= 22)
      .reduce((a, s) => a + s.duration_minutes, 0);
    if (lateMinutes > 60) {
      insights.push({
        icon: AlertTriangle,
        title: "Your productivity drops after 10 PM",
        description: "You have significant late-night study sessions. Research shows focus declines after 10 PM. Consider shifting to earlier hours.",
        type: "warning",
      });
    }

    const totalMinutes = sessions.reduce((a, s) => a + s.duration_minutes, 0);
    const avgDaily = totalMinutes / Math.max(1, new Set(sessions.map((s) => s.started_at.split("T")[0])).size);
    if (avgDaily >= 120) {
      insights.push({
        icon: TrendingUp,
        title: "Great study consistency!",
        description: `You average ${(avgDaily / 60).toFixed(1)} hours per study day. Keep this momentum going!`,
        type: "positive",
      });
    } else {
      insights.push({
        icon: Clock,
        title: "Try increasing study time",
        description: `You average ${(avgDaily / 60).toFixed(1)} hours per study day. Aim for at least 2 hours for better results.`,
        type: "tip",
      });
    }
  }

  // Task insights
  if (tasks && tasks.length > 0) {
    const completed = tasks.filter((t) => t.status === "completed").length;
    const rate = Math.round((completed / tasks.length) * 100);
    if (rate >= 70) {
      insights.push({
        icon: TrendingUp,
        title: "Excellent task completion rate!",
        description: `You've completed ${rate}% of your tasks. You're building strong habits.`,
        type: "positive",
      });
    } else if (rate < 40) {
      insights.push({
        icon: TrendingDown,
        title: "Task completion needs improvement",
        description: `Only ${rate}% of tasks completed. Try breaking large tasks into smaller, manageable pieces.`,
        type: "warning",
      });
    }

    const highPending = tasks.filter((t) => t.priority === "high" && t.status === "pending").length;
    if (highPending > 3) {
      insights.push({
        icon: AlertTriangle,
        title: `${highPending} high-priority tasks pending`,
        description: "Focus on clearing high-priority tasks first. Use the Pomodoro technique for concentrated work sessions.",
        type: "warning",
      });
    }
  }

  if (insights.length === 0) {
    insights.push({
      icon: Lightbulb,
      title: "Start tracking to get insights",
      description: "Complete tasks and log study sessions to receive personalized productivity insights.",
      type: "tip",
    });
  }

  const typeStyles = {
    positive: "border-l-success/50 bg-success/5",
    warning: "border-l-warning/50 bg-warning/5",
    tip: "border-l-primary/50 bg-primary/5",
  };

  const iconColors = {
    positive: "text-success",
    warning: "text-warning",
    tip: "text-primary",
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-display font-bold">Smart Insights</h1>
        <p className="text-muted-foreground text-sm mt-1">Personalized tips to boost your productivity</p>
      </div>

      <div className="space-y-4">
        {insights.map((insight, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`glass-card p-6 border-l-4 ${typeStyles[insight.type]}`}
          >
            <div className="flex items-start gap-4">
              <insight.icon className={`h-6 w-6 shrink-0 mt-0.5 ${iconColors[insight.type]}`} />
              <div>
                <h3 className="font-display font-semibold text-lg">{insight.title}</h3>
                <p className="text-muted-foreground text-sm mt-1">{insight.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
