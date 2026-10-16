import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BackLink } from "@/shared/components/back-link";
import { EntitySkeleton } from "@/shared/components/entity-skeleton";
import { SourceLink } from "@/shared/components/source-link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { getAssessmentById } from "@/features/panel/queries/analytics.queries";
import type { RecommendationEvidence } from "@/features/form/lib/types";
import { idSchema } from "@/shared/lib/validation";
import { formatDateTime } from "@/shared/lib/format";

type Props = PageProps<"/panel/assessments/[id]">;

const parseEvidence = (value: unknown): RecommendationEvidence[] => {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item): RecommendationEvidence[] => {
    if (!item || typeof item !== "object") return [];
    const record = item as Record<string, unknown>;
    const kinds = ["INTEREST", "SUBJECT", "STRENGTH", "WORK_STYLE"] as const;
    if (
      typeof record.conceptCode !== "string" ||
      typeof record.label !== "string" ||
      typeof record.response !== "string" ||
      typeof record.rationale !== "string" ||
      !kinds.includes(record.kind as (typeof kinds)[number]) ||
      (record.relation !== "coincide" && record.relation !== "explorar")
    ) return [];
    return [{
      conceptCode: record.conceptCode,
      label: record.label,
      kind: record.kind as RecommendationEvidence["kind"],
      response: record.response,
      relation: record.relation,
      rationale: record.rationale,
      courseNames: Array.isArray(record.courseNames)
        ? record.courseNames.filter((name): name is string => typeof name === "string")
        : [],
      sourceName: typeof record.sourceName === "string" ? record.sourceName : null,
      sourceUrl: typeof record.sourceUrl === "string" ? record.sourceUrl : null,
    }];
  });
};

const coverageLabel = (coverage: number | null) => {
  if (coverage === null) return "Sin datos";
  return coverage >= 0.75 ? "Amplia" : coverage >= 0.45 ? "Moderada" : "Inicial";
};

const probabilityLabel = (probability: number | null) =>
  probability === null
    ? null
    : new Intl.NumberFormat("es-PY", {
        style: "percent",
        maximumFractionDigits: 1,
      }).format(probability);

export default function AssessmentDetailPage({ params }: Props) {
  return (
    <Suspense fallback={<EntitySkeleton />}>
      <AssessmentDetail params={params} />
    </Suspense>
  );
}

async function AssessmentDetail({ params }: Pick<Props, "params">) {
  const { id } = await params;
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) notFound();
  const assessment = await getAssessmentById(parsed.data);
  if (!assessment) notFound();

  const groupedAnswers = new Map<string, typeof assessment.answers>();
  for (const answer of assessment.answers) {
    const groupName = answer.question.dimension.name;
    const group = groupedAnswers.get(groupName) ?? [];
    group.push(answer);
    groupedAnswers.set(groupName, group);
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div className="flex items-center gap-2">
        <BackLink href="/panel/assessments" label="Volver a orientaciones" />
        <span className="text-sm text-muted-foreground">Detalle de orientación</span>
      </div>
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          {assessment.candidate.name || "Anónima"}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Orientación #{assessment.id}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Completada {assessment.completedAt ? formatDateTime(assessment.completedAt) : "sin fecha"}
          {" · "}Cuestionario {assessment.questionnaireVersion}
          {" · "}Recomendador {assessment.recommendationVersion}
        </p>
      </header>

      <section aria-label="Ranking recomendado" className="space-y-3">
        <h2 className="text-lg font-semibold">Ranking y razones</h2>
        {assessment.results.map((item) => {
          const evidence = parseEvidence(item.evidence);
          return (
            <Card key={item.id} className="border-border bg-card shadow-sm">
              <CardHeader>
                <CardTitle>{item.rank ?? "—"}. {item.career.name}</CardTitle>
                <CardDescription>
                  {probabilityLabel(item.jevProbability) && `Afinidad JEV ${probabilityLabel(item.jevProbability)} · `}
                  Evidencia {coverageLabel(item.coverage)} · {item.recommendationVersion}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-6 text-foreground">{item.description}</p>
                {evidence.length > 0 && (
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {evidence.map((reason) => (
                      <li key={reason.conceptCode} className="rounded-xl bg-muted/60 p-3">
                        <p className="text-sm font-medium">
                          {reason.relation === "coincide" ? "Coincidencia" : "A explorar"}: {reason.label}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                          Respuesta: {reason.response}
                          {reason.courseNames.length > 0 && ` · Asignaturas: ${reason.courseNames.join(", ")}`}
                        </p>
                        {reason.sourceName && reason.sourceUrl && (
                          <p className="mt-2 text-xs">
                            <SourceLink source={{ name: reason.sourceName, url: reason.sourceUrl }} />
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
                {item.gaps.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium">Puntos para conversar</h3>
                    <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                      {item.gaps.map((gap) => <li key={gap}>{gap}</li>)}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Respuestas registradas</h2>
        {[...groupedAnswers.entries()].map(([group, answers]) => (
          <Card key={group} className="border-border bg-card shadow-sm">
            <CardHeader><CardTitle className="text-base">{group}</CardTitle></CardHeader>
            <CardContent>
              <dl className="grid gap-3 sm:grid-cols-2">
                {answers.map((answer) => (
                  <div key={answer.id} className="rounded-xl bg-muted/60 p-3">
                    <dt className="text-sm font-medium">{answer.question.text}</dt>
                    <dd className="mt-1 text-sm text-muted-foreground">
                      {answer.questionOption?.text ?? answer.text ?? "Sin respuesta"}
                    </dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
