import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { getDimensionsPage } from "../queries/dimension.queries";
import { DimensionRowActions } from "./dimension-row-actions";
import { Pagination } from "@/shared/components/pagination";
import { formatDateTime } from "@/shared/lib/format";

type Props = {
  searchParams: PageProps<"/panel/dimension">["searchParams"];
};

export const DimensionsTable = async ({ searchParams }: Props) => {
  const params = await searchParams;
  const rawPage = Array.isArray(params.page) ? params.page[0] : params.page;
  const { items, total, page, totalPages } = await getDimensionsPage(rawPage);

  if (total === 0)
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed p-10 text-center">
        <p className="font-medium">Aún no hay dimensiones</p>
        <p className="text-sm text-muted-foreground">
          Crea tu primera dimensión para comenzar.
        </p>
      </div>
    );

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-xl ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center w-32">Nombre</TableHead>
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
                <TableCell className="text-center">{dimension.name}</TableCell>
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
                    <DimensionRowActions
                      id={dimension.id}
                      name={dimension.name}
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
          {total} {total === 1 ? "dimensión" : "dimensiones"} · página {page} de{" "}
          {totalPages}
        </p>
        <Pagination
          page={page}
          totalPages={totalPages}
          basePath="/panel/dimension"
        />
      </div>
    </div>
  );
};
