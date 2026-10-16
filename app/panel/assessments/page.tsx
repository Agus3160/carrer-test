import Link from "next/link";
import { Suspense } from "react";
import { ClipboardListIcon } from "lucide-react";
import { getAssessmentsPage } from "@/features/panel/queries/analytics.queries";
import { EmptyState } from "@/shared/components/empty-state";
import { PageHeader } from "@/shared/components/page-header";
import { Pagination } from "@/shared/components/pagination";
import { Button } from "@/shared/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { formatDateTime } from "@/shared/lib/format";
import { TableSkeleton } from "@/shared/components/table-skeleton";

type Props = { searchParams: Promise<{ page?: string | string[] }> };

export default function AssessmentsPage({ searchParams }: Props) {
  return (
    <Suspense fallback={<TableSkeleton rows={8} />}>
      <AssessmentsList searchParams={searchParams} />
    </Suspense>
  );
}

async function AssessmentsList({ searchParams }: Props) {
  const params = await searchParams;
  const result = await getAssessmentsPage(params.page);
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        title="Orientaciones"
        description="Respuestas y rankings guardados para revisar la experiencia de recomendación."
      />
      {result.items.length ? (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Estudiante</TableHead>
                <TableHead>Primera recomendación</TableHead>
                <TableHead>Preguntas contestadas</TableHead>
                <TableHead>Versión</TableHead>
                <TableHead><span className="sr-only">Acciones</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.items.map((assessment) => (
                <TableRow key={assessment.id}>
                  <TableCell>{assessment.completedAt ? formatDateTime(assessment.completedAt) : "—"}</TableCell>
                  <TableCell>{assessment.candidate.name || "Anónimo"}</TableCell>
                  <TableCell>
                    {assessment.results[0]
                      ? `${assessment.results[0].career.name}${assessment.results[0].jevProbability === null ? "" : ` · ${new Intl.NumberFormat("es-PY", { style: "percent", maximumFractionDigits: 1 }).format(assessment.results[0].jevProbability)}`}`
                      : "—"}
                  </TableCell>
                  <TableCell>{assessment._count.answers}</TableCell>
                  <TableCell>{assessment.recommendationVersion}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" nativeButton={false} render={<Link href={`/panel/assessments/${assessment.id}`} />}>
                      Ver detalle
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{result.total} orientaciones</p>
            <Pagination page={result.page} totalPages={result.totalPages} basePath="/panel/assessments" />
          </div>
        </>
      ) : (
        <EmptyState
          title="Todavía no hay orientaciones"
          description="Cuando alguien finalice el cuestionario, su ranking explicable aparecerá aquí."
          icon={<ClipboardListIcon />}
        />
      )}
    </div>
  );
}
