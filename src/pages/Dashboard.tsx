import { motion } from "framer-motion";
import { useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { useTasks, useCreateTask } from "@/hooks/useTasks";
import { useStudySessions } from "@/hooks/useStudySessions";
import { CircularProgress, getProductivityScore, getGradeInfo } from "@/components/CircularProgress";
import { StudyStreak, calculateStreak } from "@/components/StudyStreak";
import { WeeklyGoal } from "@/components/WeeklyGoal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CheckCircle2,
  Clock,
  ListTodo,
  Zap,
  TrendingUp,
  TrendingDown,
  Lightbulb,
  Award,
  Flame,
  Target,
  Brain,
  Plus,
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
import { useToast } from "@/hooks/use-toast";

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

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// Animated number counter
function AnimatedStat({ value }: { value: string | number }) {
  return (
    <motion.p
      className="text-2xl font-display font-bold"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {value}
    </motion.p>
  );
}

// Achievement badge
function AchievementBadge({ icon: Icon, label, unlocked }: { icon: any; label: string; unlocked: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, type: "spring" }}
      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all duration-300 ${
        unlocked
          ? "border-primary/40 bg-primary/10 shadow-[0_0_12px_hsl(250_80%_65%/0.1)]"
          : "border-border/30 bg-card/40 opacity-40"
      }`}
    >
      <Icon className={`h-5 w-5 ${unlocked ? "text-primary" : "text-muted-foreground"}`} />
      <span className="text-[10px] text-muted-foreground text-center leading-tight">{label}</span>
    </motion.div>
  );
}

export default function Dashboard() {
  const { data: profile } = useProfile();
  const { data: tasks } = useTasks();
  const { data: sessions } = useStudySessions();
  const createTask = useCreateTask();
  const { toast } = useToast();
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickTitle, setQuickTitle] = useState("");

  const todayStr = new Date().toISOString().split("T")[0];
  const todayTasks = tasks?.filter((t) => t.created_at.startsWith(todayStr)) ?? [];
  const completedToday = todayTasks.filter((t) => t.status === "completed").length;
  const totalToday = todayTasks.length;
  const completionRate = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;

  const todaySessions = sessions?.filter((s) => s.started_at.startsWith(todayStr)) ?? [];
  const todayStudyMinutes = todaySessions.reduce((acc, s) => acc + s.duration_minutes, 0);

  // Weekly study hours
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekStartStr = weekStart.toISOString().split("T")[0];
  const weekStudyMinutes = sessions?.filter((s) => s.started_at >= weekStartStr).reduce((a, s) => a + s.duration_minutes, 0) ?? 0;
  const weekStudyHours = weekStudyMinutes / 60;

  // Last week
  const lastWeekStart = new Date(weekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  const lastWeekStartStr = lastWeekStart.toISOString().split("T")[0];
  const lastWeekMinutes = sessions?.filter((s) => s.started_at >= lastWeekStartStr && s.started_at < weekStartStr).reduce((a, s) => a + s.duration_minutes, 0) ?? 0;
  const lastWeekTasks = tasks?.filter((t) => t.created_at >= lastWeekStartStr && t.created_at < weekStartStr && t.status === "completed").length ?? 0;
  const thisWeekTasks = tasks?.filter((t) => t.created_at >= weekStartStr && t.status === "completed").length ?? 0;

  const studyChange = lastWeekMinutes > 0 ? Math.round(((weekStudyMinutes - lastWeekMinutes) / lastWeekMinutes) * 100) : weekStudyMinutes > 0 ? 100 : 0;
  const taskChange = lastWeekTasks > 0 ? Math.round(((thisWeekTasks - lastWeekTasks) / lastWeekTasks) * 100) : thisWeekTasks > 0 ? 100 : 0;

  // Streak
  const streak = calculateStreak(sessions?.map((s) => s.started_at) ?? []);

  // Productivity score
  const score = getProductivityScore(todayStudyMinutes / 60, completionRate, streak);
  const { grade, label, color } = getGradeInfo(score);

  // Score suggestion
  const scoreSuggestion =
    score >= 85 ? "Amazing work! Keep it up." :
    score >= 70 ? "Great progress! Complete a few more tasks to hit A." :
    score >= 50 ? `Complete ${Math.max(1, 3 - completedToday)} more tasks to improve your grade.` :
    "Start a focus session and complete some tasks to boost your score.";

  // Smart insights
  const insights: string[] = [];
  if (todayStudyMinutes === 0) insights.push("You haven't studied today yet. Start a focus session!");
  if (streak >= 3) insights.push(`Great consistency! ${streak}-day streak going strong.`);
  if (completionRate < 50 && totalToday > 0) insights.push("Your task completion is below 50%. Focus on finishing pending tasks.");
  if (weekStudyMinutes > 0 && weekStudyMinutes < 120) insights.push("Try increasing your weekly study time by 30 minutes.");
  if (studyChange < 0) insights.push("Your productivity dropped compared to last week. Stay consistent!");
  if (insights.length === 0) insights.push("Keep building good habits. Consistency is key!");

  // Achievements
  const totalCompleted = tasks?.filter((t) => t.status === "completed").length ?? 0;
  const totalSessions = sessions?.length ?? 0;

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

  const handleQuickAdd = () => {
    if (!quickTitle.trim()) return;
    createTask.mutate(
      { title: quickTitle, priority: "medium" },
      {
        onSuccess: () => {
          toast({ title: "Task created!" });
          setQuickTitle("");
          setQuickAddOpen(false);
        },
      }
    );
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-7xl mx-auto relative">
      {/* Welcome */}
      <motion.div variants={item}>
        <div className="flex items-center gap-2 mb-1">
          <Zap className="h-5 w-5 text-primary" />
          <span className="text-sm text-muted-foreground font-medium">Dashboard</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-display font-bold">
          {getGreeting()}, <span className="gradient-text">{profile?.display_name || "Student"}</span>
        </h1>
        <p className="text-muted-foreground mt-2 italic text-sm max-w-lg">"{getQuote()}"</p>
      </motion.div>

      {/* Score + Streak + Goal */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card-hover p-6 flex flex-col items-center justify-center gap-2">
          <CircularProgress value={score} grade={grade} gradeColor={color} label={label} />
          <p className="text-xs text-muted-foreground text-center mt-1 max-w-[200px]">{scoreSuggestion}</p>
        </div>
        <StudyStreak streak={streak} />
        <WeeklyGoal currentHours={weekStudyHours} />
      </motion.div>

      {/* Stat Cards */}
      <motion.div variants={item} className="grid grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="glass-card-hover p-5 text-center">
            <stat.icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
            <AnimatedStat value={stat.value} />
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Achievement Badges */}
      <motion.div variants={item}>
        <h3 className="font-display font-semibold text-sm mb-3 flex items-center gap-2">
          <Award className="h-4 w-4 text-primary" /> Achievements
        </h3>
        <div className="grid grid-cols-4 gap-3">
          <AchievementBadge icon={Flame} label="3-Day Streak" unlocked={streak >= 3} />
          <AchievementBadge icon={Target} label="7-Day Consistency" unlocked={streak >= 7} />
          <AchievementBadge icon={CheckCircle2} label="20 Tasks Done" unlocked={totalCompleted >= 20} />
          <AchievementBadge icon={Brain} label="5 Focus Sessions" unlocked={totalSessions >= 5} />
        </div>
      </motion.div>

      {/* Smart Insights + Weekly Comparison */}
      <div className="grid md:grid-cols-2 gap-4">
        <motion.div variants={item} className="glass-card-hover p-5">
          <h3 className="font-display font-semibold text-sm mb-3 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-warning" /> Smart Insights
          </h3>
          <div className="space-y-2">
            {insights.map((insight, i) => (
              <p key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span> {insight}
              </p>
            ))}
          </div>
        </motion.div>

        <motion.div variants={item} className="glass-card-hover p-5">
          <h3 className="font-display font-semibold text-sm mb-3">This Week vs Last Week</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Study Time</span>
              <div className="flex items-center gap-1.5">
                {studyChange >= 0 ? (
                  <TrendingUp className="h-3.5 w-3.5 text-success" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5 text-destructive" />
                )}
                <span className={`text-xs font-semibold ${studyChange >= 0 ? "text-success" : "text-destructive"}`}>
                  {studyChange >= 0 ? "+" : ""}{studyChange}%
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Tasks Completed</span>
              <div className="flex items-center gap-1.5">
                {taskChange >= 0 ? (
                  <TrendingUp className="h-3.5 w-3.5 text-success" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5 text-destructive" />
                )}
                <span className={`text-xs font-semibold ${taskChange >= 0 ? "text-success" : "text-destructive"}`}>
                  {taskChange >= 0 ? "+" : ""}{taskChange}%
                </span>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">
              {studyChange >= 0 && taskChange >= 0
                ? "You're improving! Keep the momentum going."
                : studyChange < 0 && taskChange < 0
                ? "Slight dip this week. Push through!"
                : "Mixed results. Stay consistent for better outcomes."}
            </p>
          </div>
        </motion.div>
      </div>

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

      {/* Floating Quick Add Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: "spring" }}
        onClick={() => setQuickAddOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 flex items-center justify-center hover:scale-110 transition-transform duration-200"
      >
        <Plus className="h-6 w-6" />
      </motion.button>

      <Dialog open={quickAddOpen} onOpenChange={setQuickAddOpen}>
        <DialogContent className="glass-card border-border/50 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Quick Add Task</DialogTitle>
          </DialogHeader>
          <div className="flex gap-2 mt-2">
            <Input
              placeholder="What do you need to do?"
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleQuickAdd()}
              className="bg-secondary/50 border-border/50"
              autoFocus
            />
            <Button onClick={handleQuickAdd} disabled={!quickTitle.trim()}>Add</Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
