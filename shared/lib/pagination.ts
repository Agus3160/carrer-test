export const DEFAULT_PAGE_SIZE = 8;

export type PageItem = number | "ellipsis";

export type PaginationArgs = {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
};

export type PaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
};

export const parsePage = (raw: unknown, fallback = 1): number => {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : fallback;
};

export const resolvePagination = (
  raw: unknown,
  pageSize = DEFAULT_PAGE_SIZE,
): PaginationArgs => {
  const page = parsePage(raw);
  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize };
};

export const getPaginationMeta = (
  total: number,
  { page, pageSize }: Pick<PaginationArgs, "page" | "pageSize">,
): PaginationMeta => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return {
    page,
    pageSize,
    total,
    totalPages,
    hasPrevious: page > 1,
    hasNext: page < totalPages,
  };
};

export const getPageItems = (
  page: number,
  totalPages: number,
): PageItem[] => {
  if (totalPages <= 7)
    return Array.from({ length: totalPages }, (_, index) => index + 1);

  const items: PageItem[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);

  if (start > 2) items.push("ellipsis");
  for (let current = start; current <= end; current++) items.push(current);
  if (end < totalPages - 1) items.push("ellipsis");
  items.push(totalPages);

  return items;
};

export const buildPageHref = (basePath: string, page: number): string => {
  const separator = basePath.includes("?") ? "&" : "?";
  return page <= 1 ? basePath : `${basePath}${separator}page=${page}`;
};
