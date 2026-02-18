import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Download, FileText } from "lucide-react";

interface ReportData {
  studentName: string;
  dateRange: string;
  totalStudyHours: number;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  grade: string;
  score: number;
  streakDays: number;
  weeklyData: { day: string; hours: number; tasks: number }[];
}

export function ExportReport({ data }: { data: ReportData }) {
  const [open, setOpen] = useState(false);

  const exportAsText = () => {
    const report = `
════════════════════════════════════════════
  SMART ROUTINE MANAGEMENT SYSTEM
  Productivity Report
════════════════════════════════════════════

Student: ${data.studentName}
Period:  ${data.dateRange}
Generated: ${new Date().toLocaleDateString()}

──────────────── SUMMARY ────────────────

Productivity Score: ${data.score}% (Grade ${data.grade})
Study Streak: ${data.streakDays} days
Total Study Hours: ${data.totalStudyHours.toFixed(1)}h
Tasks Completed: ${data.completedTasks}/${data.totalTasks} (${data.completionRate}%)

──────────── WEEKLY BREAKDOWN ────────────

${data.weeklyData.map((d) => `${d.day.padEnd(12)} │ ${d.hours.toFixed(1)}h study │ ${d.tasks} tasks`).join("\n")}

════════════════════════════════════════════
  © 2026 Smart Routine Management System
  Developed by Shaikh Afroz
════════════════════════════════════════════
    `.trim();

    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `productivity-report-${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAsCSV = () => {
    const rows = [
      ["Day", "Study Hours", "Tasks Completed"],
      ...data.weeklyData.map((d) => [d.day, d.hours.toFixed(1), String(d.tasks)]),
      [],
      ["Total Study Hours", data.totalStudyHours.toFixed(1)],
      ["Completion Rate", `${data.completionRate}%`],
      ["Productivity Grade", data.grade],
      ["Streak Days", String(data.streakDays)],
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `productivity-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" /> Export Report
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-card border-border/50 max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" /> Export Report Preview
          </DialogTitle>
        </DialogHeader>

        {/* Preview */}
        <div className="bg-background/80 rounded-lg p-4 text-xs font-mono space-y-2 border border-border/30 max-h-64 overflow-auto">
          <p className="text-primary font-bold text-center">SMART ROUTINE MANAGEMENT SYSTEM</p>
          <p className="text-center text-muted-foreground">Productivity Report</p>
          <hr className="border-border/30" />
          <p>Student: <span className="text-foreground">{data.studentName}</span></p>
          <p>Period: <span className="text-foreground">{data.dateRange}</span></p>
          <p>Score: <span className="text-foreground font-bold">{data.score}% (Grade {data.grade})</span></p>
          <p>Study Hours: <span className="text-foreground">{data.totalStudyHours.toFixed(1)}h</span></p>
          <p>Tasks: <span className="text-foreground">{data.completedTasks}/{data.totalTasks} ({data.completionRate}%)</span></p>
          <p>Streak: <span className="text-foreground">🔥 {data.streakDays} days</span></p>
          <hr className="border-border/30" />
          {data.weeklyData.map((d, i) => (
            <p key={i}>{d.day}: {d.hours.toFixed(1)}h, {d.tasks} tasks</p>
          ))}
        </div>

        <div className="flex gap-3 mt-2">
          <Button onClick={exportAsText} className="flex-1 gap-2">
            <FileText className="h-4 w-4" /> Download TXT
          </Button>
          <Button onClick={exportAsCSV} variant="outline" className="flex-1 gap-2">
            <Download className="h-4 w-4" /> Download CSV
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
