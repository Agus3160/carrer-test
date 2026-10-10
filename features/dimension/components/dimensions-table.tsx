import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Badge } from "@/shared/components/ui/badge";
import { getDimensionsPage } from "../queries/dimension.queries";
import { DimensionPagination } from "./dimension-pagination";
import { DimensionRowActions } from "./dimension-row-actions";

type Props = {
  searchParams: PageProps<"/panel/dimension">["searchParams"];
};

const dateFormatter = new Intl.DateTimeFormat("es", {
  dateStyle: "medium",
  timeStyle: "short",
});

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
              <TableHead className="w-16 text-center">ID</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead className="hidden sm:table-cell">Actualizado</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((dimension) => (
              <TableRow key={dimension.id}>
                <TableCell className="text-center">
                  <Badge variant="secondary">{dimension.id}</Badge>
                </TableCell>
                <TableCell className="font-medium">
                  <Link
                    href={`/panel/dimension/${dimension.id}`}
                    className="hover:underline"
                  >
                    {dimension.name}
                  </Link>
                </TableCell>
                <TableCell className="max-w-xs truncate text-muted-foreground">
                  <span title={dimension.description}>{dimension.description}</span>
                </TableCell>
                <TableCell className="hidden text-muted-foreground sm:table-cell">
                  {dateFormatter.format(dimension.updatedAt)}
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
        <DimensionPagination page={page} totalPages={totalPages} />
      </div>
    </div>
  );
};
