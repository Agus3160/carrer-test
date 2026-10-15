import { cn } from "@/shared/lib/utils";

type Props = {
  label: string;
  score: number;
  highlight?: boolean;
};

export const ScoreBar = ({ label, score, highlight }: Props) => {
  const clamped = Math.min(100, Math.max(0, Math.round(score)));

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className={cn("font-medium", highlight && "text-primary")}>{label}</span>
        <span className="font-medium tabular-nums">{clamped}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            highlight ? "bg-primary" : "bg-primary/60",
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};
