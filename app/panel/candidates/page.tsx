import Link from "next/link";
import { Suspense } from "react";
import { UsersIcon } from "lucide-react";
import { getCandidatesPage } from "@/features/panel/queries/analytics.queries";
import { EmptyState } from "@/shared/components/empty-state";
import { PageHeader } from "@/shared/components/page-header";
import { Pagination } from "@/shared/components/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { Button } from "@/shared/components/ui/button";
import { formatDateTime } from "@/shared/lib/format";
import { TableSkeleton } from "@/shared/components/table-skeleton";

type Props = { searchParams: Promise<{ page?: string | string[] }> };

export default function CandidatesPage({ searchParams }: Props) {
  return (
    <Suspense fallback={<TableSkeleton rows={8} />}>
      <CandidatesList searchParams={searchParams} />
    </Suspense>
  );
}

async function CandidatesList({ searchParams }: Props) {
  const params = await searchParams;
  const result = await getCandidatesPage(params.page);
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        title="Perfiles"
        description="Personas que completaron orientaciones. La identificación es opcional."
      />
      {result.items.length ? (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Orientaciones</TableHead>
                <TableHead>Última sugerencia</TableHead>
                <TableHead>Última actividad</TableHead>
                <TableHead><span className="sr-only">Acciones</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.items.map((candidate) => {
                const latest = candidate.assessments[0];
                return (
                  <TableRow key={candidate.id}>
                    <TableCell className="font-medium">{candidate.name || "Anónimo"}</TableCell>
                    <TableCell>{candidate._count.assessments}</TableCell>
                    <TableCell>{latest?.results[0]?.career.name ?? "—"}</TableCell>
                    <TableCell>{formatDateTime(candidate.updatedAt)}</TableCell>
                    <TableCell className="text-right">
                      {latest && (
                        <Button size="sm" variant="ghost" nativeButton={false} render={<Link href={`/panel/assessments/${latest.id}`} />}>
                          Ver orientación
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{result.total} perfiles</p>
            <Pagination page={result.page} totalPages={result.totalPages} basePath="/panel/candidates" />
          </div>
        </>
      ) : (
        <EmptyState
          title="Todavía no hay perfiles"
          description="Las orientaciones completadas aparecerán aquí. Los estudiantes pueden responder de forma anónima."
          icon={<UsersIcon />}
        />
      )}
    </div>
  );
}
