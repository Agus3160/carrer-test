import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { EmptyState } from "@/shared/components/empty-state";
import { Pagination } from "@/shared/components/pagination";
import { RowActions } from "@/shared/components/row-actions";
import { formatDateTime } from "@/shared/lib/format";
import { getCareersPage } from "../queries/career.queries";
import { deleteCareer } from "../actions/career.actions";

type Props = {
  searchParams: PageProps<"/panel/carrer">["searchParams"];
};

export const CareersTable = async ({ searchParams }: Props) => {
  const { page } = await searchParams;
  const { items, total, page: currentPage, totalPages } =
    await getCareersPage(page);

  if (total === 0)
    return (
      <EmptyState
        title="Aún no hay carreras"
        description="Crea tu primera carrera para comenzar."
      />
    );

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-xl ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead className="hidden sm:table-cell">
                Dimensiones
              </TableHead>
              <TableHead className="hidden sm:table-cell">
                Actualizado
              </TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((career) => (
              <TableRow key={career.id}>
                <TableCell className="font-medium">{career.name}</TableCell>
                <TableCell className="max-w-xs truncate text-muted-foreground">
                  <span title={career.description ?? undefined}>
                    {career.description ?? "—"}
                  </span>
                </TableCell>
                <TableCell className="hidden text-muted-foreground sm:table-cell">
                  {career._count.careerDimensions}
                </TableCell>
                <TableCell className="hidden text-muted-foreground sm:table-cell">
                  {formatDateTime(career.updatedAt)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end">
                    <RowActions
                      id={career.id}
                      name={career.name}
                      entityLabel="carrera"
                      detailHref={`/panel/carrer/${career.id}`}
                      editHref={`/panel/carrer/${career.id}/edit`}
                      onDelete={deleteCareer}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {total} {total === 1 ? "carrera" : "carreras"} · página {currentPage}{" "}
          de {totalPages}
        </p>
        <Pagination
          page={currentPage}
          totalPages={totalPages}
          basePath="/panel/carrer"
        />
      </div>
    </div>
  );
};
