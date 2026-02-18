import { motion } from "framer-motion";

interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  grade: string;
  gradeColor: string;
  label?: string;
}

export function CircularProgress({
  value,
  size = 160,
  strokeWidth = 10,
  grade,
  gradeColor,
  label,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--secondary))"
            strokeWidth={strokeWidth}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={gradeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-display font-bold" style={{ color: gradeColor }}>
            {grade}
          </span>
          <span className="text-lg font-display font-semibold text-foreground">{Math.round(value)}%</span>
        </div>
      </div>
      {label && <p className="text-xs text-muted-foreground">{label}</p>}
    </div>
  );
}

export function getProductivityScore(studyHours: number, taskRate: number, streakDays: number) {
  const studyScore = Math.min(studyHours / 5, 1) * 100;
  const streakScore = Math.min(streakDays / 7, 1) * 100;
  const score = studyScore * 0.4 + taskRate * 0.4 + streakScore * 0.2;
  return Math.round(Math.min(100, score));
}

export function getGradeInfo(score: number) {
  if (score >= 85) return { grade: "A", label: "Excellent", color: "hsl(142, 70%, 45%)" };
  if (score >= 70) return { grade: "B", label: "Good", color: "hsl(210, 100%, 52%)" };
  if (score >= 50) return { grade: "C", label: "Needs Improvement", color: "hsl(38, 92%, 50%)" };
  return { grade: "D", label: "Low Productivity", color: "hsl(0, 72%, 51%)" };
}
