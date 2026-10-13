import Link from "next/link";
import { Button } from "@/shared/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { buildPageHref, getPageItems } from "@/shared/lib/pagination";

type Props = {
  page: number;
  totalPages: number;
  basePath: string;
};

export const Pagination = ({ page, totalPages, basePath }: Props) => {
  if (totalPages <= 1) return null;

  return (
    <nav className="flex items-center gap-1" aria-label="Paginación">
      {page > 1 ? (
        <Button
          variant="outline"
          size="icon-sm"
          nativeButton={false}
          aria-label="Página anterior"
          render={<Link href={buildPageHref(basePath, page - 1)} />}
        >
          <ChevronLeftIcon />
        </Button>
      ) : (
        <Button
          variant="outline"
          size="icon-sm"
          disabled
          aria-label="Página anterior"
        >
          <ChevronLeftIcon />
        </Button>
      )}

      {getPageItems(page, totalPages).map((item, index) =>
        item === "ellipsis" ? (
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
            render={<Link href={buildPageHref(basePath, item)} />}
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
          render={<Link href={buildPageHref(basePath, page + 1)} />}
        >
          <ChevronRightIcon />
        </Button>
      ) : (
        <Button
          variant="outline"
          size="icon-sm"
          disabled
          aria-label="Página siguiente"
        >
          <ChevronRightIcon />
        </Button>
      )}
    </nav>
  );
};
