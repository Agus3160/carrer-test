import { BookOpenIcon, CheckCircle2Icon, LightbulbIcon } from "lucide-react";
import { SourceLink } from "@/shared/components/source-link";
import type { CareerResult } from "../lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

export const RecommendationCard = ({
  career,
}: {
  career: CareerResult;
}) => {
  const matched = career.evidence.filter((item) => item.relation === "coincide");
  const tradeoffs = career.evidence.filter((item) => item.relation === "explorar");
  const probability = new Intl.NumberFormat("es-PY", {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(career.jevProbability);

  return (
    <Card className="overflow-hidden border-border bg-card shadow-sm">
      <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
            Recomendación {career.rank}
          </div>
          <CardTitle className="text-xl">{career.careerName}</CardTitle>
          <CardDescription className="max-w-2xl leading-6">
            {career.description}
          </CardDescription>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <span className="inline-flex w-fit rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
            Afinidad JEV {probability}
          </span>
          <span className="inline-flex w-fit rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-foreground">
            Evidencia {career.coverageLabel.toLowerCase()}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="rounded-xl bg-primary/10 p-4 text-sm leading-6 text-foreground">
          {career.summary}
        </p>

        {matched.length > 0 && (
          <section aria-labelledby={`matches-${career.careerId}`} className="space-y-2">
            <h3 id={`matches-${career.careerId}`} className="flex items-center gap-2 text-sm font-semibold">
              <CheckCircle2Icon className="size-4 text-primary" aria-hidden="true" />
              Lo que coincide con tus respuestas
            </h3>
            <ul className="grid gap-2 sm:grid-cols-2">
              {matched.slice(0, 4).map((item) => (
                <li key={item.conceptCode} className="rounded-lg border border-border p-3">
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {item.courseNames.length
                      ? `Lo relacionamos con ${item.courseNames.join(" y ")}.`
                      : item.rationale}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {career.courses.length > 0 && (
          <section className="space-y-2">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <BookOpenIcon className="size-4 text-primary" aria-hidden="true" />
              Asignaturas relacionadas
            </h3>
            <ul className="flex flex-wrap gap-2">
              {career.courses.map((course) => (
                <li key={course} className="rounded-full bg-muted px-3 py-1.5 text-xs text-foreground">
                  {course}
                </li>
              ))}
            </ul>
          </section>
        )}

        {career.opportunities.length > 0 && (
          <section className="space-y-2">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <LightbulbIcon className="size-4 text-primary" aria-hidden="true" />
              Para explorar con más calma
            </h3>
            <ul className="space-y-1 text-sm leading-6 text-muted-foreground">
              {career.opportunities.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </section>
        )}

        {tradeoffs.length > 0 && career.opportunities.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Algunas preferencias tuyas no aparecen como foco de esta carrera; puedes revisar las razones y decidir qué pesa más para ti.
          </p>
        )}

        {career.sources.length > 0 && (
          <details className="border-t border-border/70 pt-3">
            <summary className="cursor-pointer text-sm font-medium text-foreground">
              Ver fuentes y cómo se relacionaron
            </summary>
            <ul className="mt-3 space-y-2">
              {career.sources.map((source) => (
                <li key={source.url + source.name} className="text-sm">
                  <SourceLink source={source} />
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              Los vínculos entre preferencias y actividades profesionales están en revisión inicial; sirven para explorar opciones, no para limitarte.
            </p>
          </details>
        )}
      </CardContent>
    </Card>
  );
};
