import Link from "next/link";
import { Suspense } from "react";
import { ArrowRightIcon, BookOpenCheckIcon, ClipboardListIcon, FileQuestionIcon, UsersIcon } from "lucide-react";
import { prisma } from "@/shared/lib/prisma";
import { getSessionOrRedirect } from "@/shared/lib/session";
import { formatDateTime } from "@/shared/lib/format";
import { MetricCard } from "@/shared/components/metric-card";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";

const shortcuts = [
  { href: "/panel/knowledge", label: "Revisar la base de conocimiento", icon: BookOpenCheckIcon },
  { href: "/panel/assessments", label: "Ver orientaciones completadas", icon: ClipboardListIcon },
  { href: "/panel/questions", label: "Administrar preguntas", icon: FileQuestionIcon },
];

export default function PanelPage() {
  return (
    <Suspense fallback={<PanelSkeleton />}>
      <PanelOverview />
    </Suspense>
  );
}

function PanelSkeleton() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-7" aria-label="Cargando panel" role="status">
      <Skeleton className="h-24 w-full" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-28" />)}
      </div>
      <Skeleton className="h-80 w-full" />
    </div>
  );
}

async function PanelOverview() {
  await getSessionOrRedirect();
  const [careerCount, questionCount, assessmentCount, candidateCount, latest] =
    await Promise.all([
      prisma.career.count({ where: { deletedAt: null } }),
      prisma.question.count({ where: { deletedAt: null } }),
      prisma.assessment.count({ where: { completedAt: { not: null } } }),
      prisma.candidate.count(),
      prisma.assessment.findMany({
        where: { completedAt: { not: null } },
        orderBy: { completedAt: "desc" },
        take: 5,
        include: {
          candidate: { select: { name: true } },
          results: {
            orderBy: { rank: "asc" },
            take: 1,
            include: { career: { select: { name: true } } },
          },
        },
      }),
    ]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-7">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Administración</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Resumen de Brújula</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Revisa el catálogo, el cuestionario y las orientaciones registradas.
        </p>
      </header>

      <section aria-label="Indicadores" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Carreras activas" value={careerCount} description="Perfiles disponibles" icon={BookOpenCheckIcon} />
        <MetricCard label="Preguntas activas" value={questionCount} description="En el recorrido vocacional" icon={FileQuestionIcon} />
        <MetricCard label="Orientaciones" value={assessmentCount} description="Recorridos completados" icon={ClipboardListIcon} />
        <MetricCard label="Perfiles" value={candidateCount} description="Incluye respuestas anónimas" icon={UsersIcon} />
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle>Accesos rápidos</CardTitle>
            <CardDescription>Continúa con el contenido principal del sistema.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {shortcuts.map((item) => (
              <Button key={item.href} variant="outline" nativeButton={false} render={<Link href={item.href} />} className="justify-between">
                <span className="flex items-center gap-2">
                  <item.icon className="size-4 text-primary" />
                  {item.label}
                </span>
                <ArrowRightIcon />
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle>Actividad reciente</CardTitle>
            <CardDescription>Solo visible para personas administradoras.</CardDescription>
          </CardHeader>
          <CardContent>
            {latest.length ? (
              <ul className="divide-y divide-border/70">
                {latest.map((assessment) => (
                  <li key={assessment.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                    <div>
                      <p className="text-sm font-medium">{assessment.candidate.name || "Orientación anónima"}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {assessment.completedAt ? formatDateTime(assessment.completedAt) : "Sin fecha"}
                        {" · "}Primera sugerencia: {assessment.results[0]?.career.name ?? "Sin resultado"}
                      </p>
                    </div>
                    <Button size="sm" variant="ghost" nativeButton={false} render={<Link href={`/panel/assessments/${assessment.id}`} />}>
                      Ver
                      <ArrowRightIcon />
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-xl bg-muted/60 p-4 text-sm text-muted-foreground">
                Todavía no hay orientaciones completadas.
              </p>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
