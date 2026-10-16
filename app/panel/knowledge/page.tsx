import { BookOpenCheckIcon, Link2Icon, TriangleAlertIcon } from "lucide-react";
import { Suspense } from "react";
import { getKnowledgeLinksPage } from "@/features/panel/queries/analytics.queries";
import { KnowledgeLinkEditor } from "@/features/panel/components/knowledge-link-editor";
import { EmptyState } from "@/shared/components/empty-state";
import { MetricCard } from "@/shared/components/metric-card";
import { PageHeader } from "@/shared/components/page-header";
import { Pagination } from "@/shared/components/pagination";
import { SourceLink } from "@/shared/components/source-link";
import { Badge } from "@/shared/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { TableSkeleton } from "@/shared/components/table-skeleton";

type Props = { searchParams: Promise<{ page?: string | string[] }> };

const conceptTypeLabel: Record<string, string> = {
  SUBJECT: "Materia",
  INTEREST: "Interés",
  SKILL: "Habilidad",
  WORK_ACTIVITY: "Actividad",
  WORK_STYLE: "Preferencia",
  WORK_CONTEXT: "Contexto",
  WORK_FIELD: "Ámbito",
};

export default function KnowledgePage({ searchParams }: Props) {
  return (
    <Suspense fallback={<TableSkeleton rows={8} />}>
      <KnowledgeContent searchParams={searchParams} />
    </Suspense>
  );
}

async function KnowledgeContent({ searchParams }: Props) {
  const params = await searchParams;
  const data = await getKnowledgeLinksPage(params.page);
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader
        title="Base de conocimiento"
        description="Revisa las relaciones entre las carreras y sus materias, habilidades, actividades y preferencias."
      />
      <section aria-label="Resumen de la base" className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Conceptos" value={data.conceptCount} description="Señales que compara el recomendador" icon={BookOpenCheckIcon} />
        <MetricCard label="Asignaturas" value={data.courseCount} description="Muestras curriculares con fuente" icon={BookOpenCheckIcon} />
        <MetricCard label="Relaciones preliminares" value={data.preliminaryCount} description="Requieren revisión académica" icon={TriangleAlertIcon} />
      </section>
      <div className="rounded-xl border border-primary/30 bg-primary/10 p-4 text-sm leading-6 text-foreground">
        Las fuentes curriculares respaldan las asignaturas. Los vínculos con actividades y estilos de trabajo son relaciones iniciales que un orientador o docente debe validar antes de interpretarlas como conclusiones.
      </div>
      {data.items.length ? (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Carrera</TableHead>
                <TableHead>Concepto relacionado</TableHead>
                <TableHead>Fundamento y fuente</TableHead>
                <TableHead>Ponderación y revisión</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((link) => (
                <TableRow key={link.id} className="align-top">
                  <TableCell className="min-w-48 font-medium">{link.career.name}</TableCell>
                  <TableCell className="min-w-48">
                    <p className="font-medium">{link.concept.label}</p>
                    <Badge variant="outline" className="mt-2">{conceptTypeLabel[link.concept.type] ?? link.concept.type}</Badge>
                  </TableCell>
                  <TableCell className="min-w-72 max-w-md whitespace-normal">
                    <p className="text-sm leading-5 text-muted-foreground">{link.rationale}</p>
                    {link.sourceName && link.sourceUrl && (
                      <p className="mt-2 text-xs">
                        <SourceLink source={{ name: link.sourceName, url: link.sourceUrl, version: link.sourceVersion }} />
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="min-w-64">
                    <KnowledgeLinkEditor id={link.id} relevance={link.relevance} status={link.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between">
            <p className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <Link2Icon className="size-4" />
              {data.total} relaciones
            </p>
            <Pagination page={data.page} totalPages={data.totalPages} basePath="/panel/knowledge" />
          </div>
        </>
      ) : (
        <EmptyState
          title="La base de conocimiento está vacía"
          description="Ejecuta el seed para cargar las carreras, asignaturas y relaciones iniciales."
          icon={<BookOpenCheckIcon />}
        />
      )}
    </div>
  );
}
