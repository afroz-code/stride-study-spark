import { motion } from "framer-motion";
import { useProfile } from "@/hooks/useProfile";
import { useTasks } from "@/hooks/useTasks";
import { useStudySessions } from "@/hooks/useStudySessions";
import { CircularProgress, getProductivityScore, getGradeInfo } from "@/components/CircularProgress";
import { StudyStreak, calculateStreak } from "@/components/StudyStreak";
import { WeeklyGoal } from "@/components/WeeklyGoal";
import {
  CheckCircle2,
  Clock,
  ListTodo,
  Zap,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

const quotes = [
  "Success is the sum of small efforts, repeated day in and day out.",
  "The secret of getting ahead is getting started.",
  "Don't watch the clock; do what it does. Keep going.",
  "Focus on being productive instead of busy.",
  "The only way to do great work is to love what you do.",
  "It does not matter how slowly you go as long as you do not stop.",
  "Believe you can and you're halfway there.",
  "The future depends on what you do today.",
];

function getQuote() {
  const day = new Date().getDate();
  return quotes[day % quotes.length];
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function Dashboard() {
  const { data: profile } = useProfile();
  const { data: tasks } = useTasks();
  const { data: sessions } = useStudySessions();

  const todayStr = new Date().toISOString().split("T")[0];
  const todayTasks = tasks?.filter((t) => t.created_at.startsWith(todayStr)) ?? [];
  const completedToday = todayTasks.filter((t) => t.status === "completed").length;
  const totalToday = todayTasks.length;
  const completionRate = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;

  const todaySessions = sessions?.filter((s) => s.started_at.startsWith(todayStr)) ?? [];
  const todayStudyMinutes = todaySessions.reduce((acc, s) => acc + s.duration_minutes, 0);

  // Weekly study hours for goal
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekStartStr = weekStart.toISOString().split("T")[0];
  const weekStudyMinutes = sessions?.filter((s) => s.started_at >= weekStartStr).reduce((a, s) => a + s.duration_minutes, 0) ?? 0;
  const weekStudyHours = weekStudyMinutes / 60;

  // Streak
  const streak = calculateStreak(sessions?.map((s) => s.started_at) ?? []);

  // Productivity score
  const score = getProductivityScore(todayStudyMinutes / 60, completionRate, streak);
  const { grade, label, color } = getGradeInfo(score);

  // Weekly chart data
  const weekData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const ds = d.toISOString().split("T")[0];
    const dayTasks = tasks?.filter((t) => t.created_at.startsWith(ds)) ?? [];
    const dayCompleted = dayTasks.filter((t) => t.status === "completed").length;
    const dayMinutes = sessions?.filter((s) => s.started_at.startsWith(ds)).reduce((a, s) => a + s.duration_minutes, 0) ?? 0;
    return {
      day: d.toLocaleDateString("en", { weekday: "short" }),
      tasks: dayCompleted,
      hours: Math.round((dayMinutes / 60) * 10) / 10,
    };
  });

  const stats = [
    { label: "Today's Tasks", value: totalToday, icon: ListTodo, color: "text-info" },
    { label: "Completed", value: completedToday, icon: CheckCircle2, color: "text-success" },
    { label: "Study Today", value: `${(todayStudyMinutes / 60).toFixed(1)}h`, icon: Clock, color: "text-primary" },
  ];

  const tooltipStyle = {
    backgroundColor: "hsl(222, 47%, 8%)",
    border: "1px solid hsl(222, 30%, 16%)",
    borderRadius: "8px",
    color: "hsl(210, 40%, 96%)",
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome */}
      <motion.div variants={item}>
        <div className="flex items-center gap-2 mb-1">
          <Zap className="h-5 w-5 text-primary" />
          <span className="text-sm text-muted-foreground font-medium">Dashboard</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-display font-bold">
          Welcome back, <span className="gradient-text">{profile?.display_name || "Student"}</span>
        </h1>
        <p className="text-muted-foreground mt-2 italic text-sm max-w-lg">"{getQuote()}"</p>
      </motion.div>

      {/* Score + Streak + Goal Row */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card-hover p-6 flex items-center justify-center">
          <CircularProgress value={score} grade={grade} gradeColor={color} label={label} />
        </div>
        <StudyStreak streak={streak} />
        <WeeklyGoal currentHours={weekStudyHours} />
      </motion.div>

      {/* Stat Cards */}
      <motion.div variants={item} className="grid grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="glass-card-hover p-5 text-center">
            <stat.icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
            <p className="text-2xl font-display font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <motion.div variants={item} className="glass-card p-6">
          <h3 className="font-display font-semibold mb-4">Tasks Completed This Week</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 16%)" />
                <XAxis dataKey="day" stroke="hsl(215, 20%, 55%)" fontSize={12} />
                <YAxis stroke="hsl(215, 20%, 55%)" fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="tasks" fill="hsl(250, 80%, 65%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={item} className="glass-card p-6">
          <h3 className="font-display font-semibold mb-4">Study Hours This Week</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weekData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 16%)" />
                <XAxis dataKey="day" stroke="hsl(215, 20%, 55%)" fontSize={12} />
                <YAxis stroke="hsl(215, 20%, 55%)" fontSize={12} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="hours" stroke="hsl(230, 60%, 55%)" strokeWidth={2} dot={{ fill: "hsl(230, 60%, 55%)" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
