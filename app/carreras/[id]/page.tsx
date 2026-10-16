import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, ArrowRightIcon, BookOpenIcon } from "lucide-react";
import { getPublicCareerById } from "@/features/career/queries/public-career.queries";
import { BackLink } from "@/shared/components/back-link";
import { SourceLink } from "@/shared/components/source-link";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { idSchema } from "@/shared/lib/validation";

type Props = PageProps<"/carreras/[id]">;

const conceptLabels: Record<string, string> = {
  SUBJECT: "Materias",
  INTEREST: "Intereses",
  SKILL: "Habilidades",
  WORK_ACTIVITY: "Actividades",
  WORK_STYLE: "Preferencias de trabajo",
  WORK_CONTEXT: "Entornos de trabajo",
  WORK_FIELD: "Ámbitos laborales",
};

export const metadata: Metadata = {
  title: "Explorar carrera | Brújula",
  description: "Explora asignaturas de referencia, intereses y fuentes de una carrera.",
};

export default function CareerDetailPage({ params }: Props) {
  return (
    <Suspense fallback={<CareerDetailSkeleton />}>
      <CareerDetailContent params={params} />
    </Suspense>
  );
}

function CareerDetailSkeleton() {
  return (
    <main className="min-h-dvh bg-background px-5 py-6 sm:px-8 sm:py-10">
      <div aria-label="Cargando carrera" role="status" className="mx-auto flex max-w-4xl flex-col gap-5">
        <div className="h-8 w-40 animate-pulse rounded-lg bg-card" />
        <div className="h-56 animate-pulse rounded-[2rem] bg-primary/10" />
        <div className="h-80 animate-pulse rounded-3xl bg-card" />
      </div>
    </main>
  );
}

async function CareerDetailContent({ params }: Pick<Props, "params">) {
  const { id } = await params;
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) notFound();
  const career = await getPublicCareerById(parsed.data);
  if (!career) notFound();

  const grouped = new Map<string, typeof career.knowledgeLinks>();
  for (const link of career.knowledgeLinks) {
    const group = grouped.get(link.concept.type) ?? [];
    group.push(link);
    grouped.set(link.concept.type, group);
  }
  const sources = new Map<string, { name: string; url: string; version: string }>();
  for (const course of career.courses)
    sources.set(course.sourceUrl, {
      name: course.sourceName,
      url: course.sourceUrl,
      version: course.sourceVersion,
    });
  for (const link of career.knowledgeLinks)
    if (link.sourceName && link.sourceUrl)
      sources.set(link.sourceUrl, {
        name: link.sourceName,
        url: link.sourceUrl,
        version: link.sourceVersion ?? "relación preliminar",
      });

  return (
    <main className="min-h-dvh bg-background px-5 py-6 sm:px-8 sm:py-10">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BackLink href="/carreras" label="Volver al catálogo de carreras" />
            <Link href="/carreras" className="text-sm font-medium text-foreground">Carreras</Link>
          </div>
          <Button nativeButton={false} render={<Link href="/form" />}>
            Hacer orientación
            <ArrowRightIcon />
          </Button>
        </header>

        <section className="rounded-[2rem] bg-[#08110c] p-6 text-foreground sm:p-9">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Perfil de carrera
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{career.name}</h1>
          <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">
            {career.description ?? "La descripción de esta carrera está en preparación."}
          </p>
        </section>

        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpenIcon className="size-5 text-primary" />
              Asignaturas de referencia
            </CardTitle>
            <p className="text-sm leading-6 text-muted-foreground">
              Selección de materias del plan consultado; cada una se conecta con familias temáticas para explicar las recomendaciones.
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            {career.courses.length > 0 ? (
              <ol className="grid gap-3 sm:grid-cols-2">
                {career.courses.map((course) => (
                  <li key={course.id} className="rounded-xl border border-border p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {course.semester ? `${course.semester}° semestre` : "Plan de estudios"}
                      {course.code && ` · ${course.code}`}
                    </p>
                    <p className="mt-1 font-medium">{course.name}</p>
                    <ul className="mt-3 flex flex-wrap gap-1.5">
                      {course.conceptCodes.map((code) => {
                        const concept = career.knowledgeLinks.find((link) => link.concept.code === code)?.concept;
                        return concept ? (
                          <li key={code} className="rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary">
                            {concept.label}
                          </li>
                        ) : null;
                      })}
                    </ul>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-muted-foreground">Aún no hay materias vinculadas.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle>Intereses y actividades relacionadas</CardTitle>
            <p className="text-sm leading-6 text-muted-foreground">
              Estos vínculos ayudan a explicar las sugerencias; son hipótesis iniciales, no requisitos de ingreso ni rasgos de personalidad.
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            {[...grouped.entries()].map(([type, links]) => (
              <section key={type}>
                <h2 className="mb-2 text-sm font-semibold">{conceptLabels[type] ?? type}</h2>
                <ul className="flex flex-wrap gap-2">
                  {links.map((link) => (
                    <li key={link.id} title={link.rationale} className="rounded-full bg-muted px-3 py-1.5 text-xs text-foreground">
                      {link.concept.label}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </CardContent>
        </Card>

        <Card className="border-primary/30 bg-primary/10 shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Fuentes y estado de revisión</CardTitle>
            <p className="text-sm leading-6 text-muted-foreground">
              Los planes respaldan las asignaturas. Las asociaciones con actividades y preferencias profesionales están en revisión inicial.
            </p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {[...sources.values()].map((source) => (
                <li key={source.url} className="text-sm">
                  <SourceLink source={source} />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div>
          <Button variant="outline" nativeButton={false} render={<Link href="/carreras" />}>
            <ArrowLeftIcon />
            Volver al catálogo
          </Button>
        </div>
      </div>
    </main>
  );
}
