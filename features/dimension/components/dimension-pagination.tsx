import Link from "next/link";
import { Button } from "@/shared/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

const hrefFor = (page: number) =>
  page <= 1 ? "/panel/dimension" : `/panel/dimension?page=${page}`;

const getPageNumbers = (page: number, totalPages: number): (number | "…")[] => {
  if (totalPages <= 7)
    return Array.from({ length: totalPages }, (_, index) => index + 1);

  const pages: (number | "…")[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);

  if (start > 2) pages.push("…");
  for (let current = start; current <= end; current++) pages.push(current);
  if (end < totalPages - 1) pages.push("…");
  pages.push(totalPages);

  return pages;
};

type Props = {
  page: number;
  totalPages: number;
};

export const DimensionPagination = ({ page, totalPages }: Props) => {
  if (totalPages <= 1) return null;

  return (
    <nav className="flex items-center gap-1" aria-label="Paginación">
      {page > 1 ? (
        <Button
          variant="outline"
          size="icon-sm"
          nativeButton={false}
          aria-label="Página anterior"
          render={<Link href={hrefFor(page - 1)} />}
        >
          <ChevronLeftIcon />
        </Button>
      ) : (
        <Button variant="outline" size="icon-sm" disabled aria-label="Página anterior">
          <ChevronLeftIcon />
        </Button>
      )}

      {getPageNumbers(page, totalPages).map((item, index) =>
        item === "…" ? (
          <span
            key={`ellipsis-${index}`}
            className="flex size-7 items-center justify-center text-sm text-muted-foreground"
          >
            …
          </span>
        ) : item === page ? (
          <Button key={item} size="icon-sm" disabled aria-current="page">
            {item}
          </Button>
        ) : (
          <Button
            key={item}
            variant="ghost"
            size="icon-sm"
            nativeButton={false}
            render={<Link href={hrefFor(item)} />}
          >
            {item}
          </Button>
        ),
      )}

      {page < totalPages ? (
        <Button
          variant="outline"
          size="icon-sm"
          nativeButton={false}
          aria-label="Página siguiente"
          render={<Link href={hrefFor(page + 1)} />}
        >
          <ChevronRightIcon />
        </Button>
      ) : (
        <Button variant="outline" size="icon-sm" disabled aria-label="Página siguiente">
          <ChevronRightIcon />
        </Button>
      )}
    </nav>
  );
};
