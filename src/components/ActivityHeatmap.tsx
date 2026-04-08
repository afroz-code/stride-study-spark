import { motion } from "framer-motion";
import { useStudySessions } from "@/hooks/useStudySessions";
import { useTasks } from "@/hooks/useTasks";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function ActivityHeatmap() {
  const { data: sessions } = useStudySessions();
  const { data: tasks } = useTasks();

  // Build 12 weeks (84 days) of data
  const days = Array.from({ length: 84 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (83 - i));
    return d.toISOString().split("T")[0];
  });

  const getActivity = (dateStr: string) => {
    const mins = sessions?.filter((s) => s.started_at.startsWith(dateStr)).reduce((a, s) => a + s.duration_minutes, 0) ?? 0;
    const completed = tasks?.filter((t) => t.created_at.startsWith(dateStr) && t.status === "completed").length ?? 0;
    return mins + completed * 10; // weighted score
  };

  const getLevel = (score: number) => {
    if (score === 0) return 0;
    if (score < 30) return 1;
    if (score < 60) return 2;
    if (score < 120) return 3;
    return 4;
  };

  const levelColors = [
    "bg-secondary/40",
    "bg-primary/20",
    "bg-primary/40",
    "bg-primary/60",
    "bg-primary/90",
  ];

  // Group by weeks (columns)
  const weeks: string[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <div className="glass-card p-5">
      <h3 className="font-display font-semibold text-sm mb-3">Activity Heatmap</h3>
      <div className="flex gap-1 overflow-x-auto pb-1">
        <TooltipProvider delayDuration={100}>
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((day) => {
                const score = getActivity(day);
                const level = getLevel(score);
                return (
                  <Tooltip key={day}>
                    <TooltipTrigger asChild>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: wi * 0.02 }}
                        className={`h-3 w-3 rounded-[2px] ${levelColors[level]} transition-colors`}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-[10px]">
                      <p>{new Date(day).toLocaleDateString("en", { month: "short", day: "numeric" })}</p>
                      <p className="text-muted-foreground">{score > 0 ? `${score} activity pts` : "No activity"}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          ))}
        </TooltipProvider>
      </div>
      <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground">
        <span>Less</span>
        {levelColors.map((c, i) => (
          <div key={i} className={`h-2.5 w-2.5 rounded-[2px] ${c}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
