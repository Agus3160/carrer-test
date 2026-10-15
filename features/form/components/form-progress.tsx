import { cn } from "@/shared/lib/utils";
import type { FormPhase } from "../lib/types";

const steps: { phase: FormPhase; label: string }[] = [
  { phase: 0, label: "Identificación" },
  { phase: 1, label: "Cuestionario" },
  { phase: 3, label: "Resultados" },
  { phase: 4, label: "Finalizar" },
];

export const FormProgress = ({ phase }: { phase: FormPhase }) => {
  const activeIndex = Math.max(
    0,
    steps.findIndex((step) => step.phase === phase),
  );
  const percent = ((activeIndex + 1) / steps.length) * 100;

  return (
    <div className="flex flex-col gap-3" aria-label="Progreso del test">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      <ol className="flex justify-between gap-2 text-xs">
        {steps.map((step, index) => (
          <li
            key={step.label}
            className={cn(
              "truncate",
              index <= activeIndex
                ? "font-medium text-foreground"
                : "text-muted-foreground",
            )}
          >
            {step.label}
          </li>
        ))}
      </ol>
    </div>
  );
};
