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
import { getDimensionsPage } from "../queries/dimension.queries";
import { deleteDimension } from "../actions/dimension.actions";

type Props = {
  searchParams: PageProps<"/panel/dimension">["searchParams"];
};

export const DimensionsTable = async ({ searchParams }: Props) => {
  const { page } = await searchParams;
  const {
    items,
    total,
    page: currentPage,
    totalPages,
  } = await getDimensionsPage(page);

  if (total === 0)
    return (
      <EmptyState
        title="Aún no hay dimensiones"
        description="Crea tu primera dimensión para comenzar."
      />
    );

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-xl ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-32">Nombre</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead className="hidden sm:table-cell">
                Actualizado
              </TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((dimension) => (
              <TableRow key={dimension.id}>
                <TableCell>{dimension.name}</TableCell>
                <TableCell className="max-w-xs truncate text-muted-foreground">
                  <span title={dimension.description}>
                    {dimension.description}
                  </span>
                </TableCell>
                <TableCell className="hidden text-muted-foreground sm:table-cell">
                  {formatDateTime(dimension.updatedAt)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end">
                    <RowActions
                      id={dimension.id}
                      name={dimension.name}
                      entityLabel="dimensión"
                      detailHref={`/panel/dimension/${dimension.id}`}
                      editHref={`/panel/dimension/${dimension.id}/edit`}
                      onDelete={deleteDimension}
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
          {total} {total === 1 ? "dimensión" : "dimensiones"} · página{" "}
          {currentPage} de {totalPages}
        </p>
        <Pagination
          page={currentPage}
          totalPages={totalPages}
          basePath="/panel/dimension"
        />
      </div>
    </div>
  );
};
