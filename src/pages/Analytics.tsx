import { useState } from "react";
import { motion } from "framer-motion";
import { useTasks } from "@/hooks/useTasks";
import { useStudySessions } from "@/hooks/useStudySessions";
import { useProfile } from "@/hooks/useProfile";
import { CircularProgress, getProductivityScore, getGradeInfo } from "@/components/CircularProgress";
import { calculateStreak } from "@/components/StudyStreak";
import { ExportReport } from "@/components/ExportReport";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell,
} from "recharts";
import { BarChart3, TrendingUp } from "lucide-react";

export default function Analytics() {
  const { data: tasks } = useTasks();
  const { data: sessions } = useStudySessions();
  const { data: profile } = useProfile();
  const [range, setRange] = useState<7 | 14 | 30>(7);

  const days = Array.from({ length: range }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (range - 1 - i));
    return d.toISOString().split("T")[0];
  });

  const chartData = days.map((ds) => {
    const dayTasks = tasks?.filter((t) => t.created_at.startsWith(ds)) ?? [];
    const completed = dayTasks.filter((t) => t.status === "completed").length;
    const total = dayTasks.length;
    const minutes = sessions?.filter((s) => s.started_at.startsWith(ds)).reduce((a, s) => a + s.duration_minutes, 0) ?? 0;
    return {
      date: new Date(ds).toLocaleDateString("en", { month: "short", day: "numeric" }),
      completed,
      total,
      hours: Math.round((minutes / 60) * 10) / 10,
      rate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  });

  const totalCompleted = chartData.reduce((a, d) => a + d.completed, 0);
  const totalTasks = chartData.reduce((a, d) => a + d.total, 0);
  const avgRate = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;
  const totalHours = chartData.reduce((a, d) => a + d.hours, 0);
  const streak = calculateStreak(sessions?.map((s) => s.started_at) ?? []);
  const score = getProductivityScore(totalHours / Math.max(1, range / 7), avgRate, streak);
  const { grade, color } = getGradeInfo(score);

  const pieData = [
    { name: "Completed", value: totalCompleted, color: "hsl(142, 70%, 45%)" },
    { name: "Pending", value: totalTasks - totalCompleted, color: "hsl(222, 30%, 16%)" },
  ];

  const tooltipStyle = {
    backgroundColor: "hsl(222, 47%, 8%)",
    border: "1px solid hsl(222, 30%, 16%)",
    borderRadius: "8px",
    color: "hsl(210, 40%, 96%)",
  };

  const reportData = {
    studentName: profile?.display_name || "Student",
    dateRange: `Last ${range} days`,
    totalStudyHours: totalHours,
    totalTasks,
    completedTasks: totalCompleted,
    completionRate: avgRate,
    grade,
    score,
    streakDays: streak,
    weeklyData: chartData.map((d) => ({ day: d.date, hours: d.hours, tasks: d.completed })),
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Analytics</h1>
          <p className="text-muted-foreground text-sm mt-1">Track your performance over time</p>
        </div>
        <div className="flex items-center gap-3">
          <ExportReport data={reportData} />
          <div className="flex gap-2">
            {([7, 14, 30] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${range === r ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
              >
                {r}d
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Score + Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-5 flex items-center justify-center">
          <CircularProgress value={score} grade={grade} gradeColor={color} size={120} />
        </div>
        <div className="glass-card p-5 text-center flex flex-col justify-center">
          <BarChart3 className="h-6 w-6 mx-auto mb-2 text-primary" />
          <p className="text-2xl font-display font-bold">{avgRate}%</p>
          <p className="text-xs text-muted-foreground mt-1">Completion Rate</p>
        </div>
        <div className="glass-card p-5 text-center flex flex-col justify-center">
          <TrendingUp className="h-6 w-6 mx-auto mb-2 text-accent" />
          <p className="text-2xl font-display font-bold">{totalHours.toFixed(1)}h</p>
          <p className="text-xs text-muted-foreground mt-1">Total Study Hours</p>
        </div>
        <div className="glass-card p-5 text-center flex flex-col justify-center">
          <p className="text-2xl font-display font-bold">{totalCompleted}/{totalTasks}</p>
          <p className="text-xs text-muted-foreground mt-1">Tasks Completed</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="font-display font-semibold mb-4">Study Hours Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 16%)" />
                <XAxis dataKey="date" stroke="hsl(215, 20%, 55%)" fontSize={11} />
                <YAxis stroke="hsl(215, 20%, 55%)" fontSize={11} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="hours" stroke="hsl(250, 80%, 65%)" strokeWidth={2} dot={{ fill: "hsl(250, 80%, 65%)", r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="font-display font-semibold mb-4">Task Completion Rate</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 16%)" />
                <XAxis dataKey="date" stroke="hsl(215, 20%, 55%)" fontSize={11} />
                <YAxis stroke="hsl(215, 20%, 55%)" fontSize={11} unit="%" />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="rate" fill="hsl(230, 60%, 55%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="font-display font-semibold mb-4">Tasks Overview</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} innerRadius={50} dataKey="value" strokeWidth={0}>
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="font-display font-semibold mb-4">Weekly Performance</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 16%)" />
                <XAxis dataKey="date" stroke="hsl(215, 20%, 55%)" fontSize={11} />
                <YAxis stroke="hsl(215, 20%, 55%)" fontSize={11} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="completed" fill="hsl(142, 70%, 45%)" radius={[4, 4, 0, 0]} name="Completed" />
                <Bar dataKey="total" fill="hsl(222, 30%, 20%)" radius={[4, 4, 0, 0]} name="Total" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
