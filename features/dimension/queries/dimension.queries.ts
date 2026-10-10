"server only";

import { prisma } from "@/shared/lib/prisma";
import { DIMENSION_PAGE_SIZE } from "../schemas/dimension.schema";
import { Dimension } from "@/generated/prisma/client";
import { Paginated } from "@/shared/types/paginated";

export const getDimensionsPage = async (
  rawPage: unknown,
  pageSize = DIMENSION_PAGE_SIZE,
): Promise<Paginated<Dimension>> => {
  const parsedPage = Number(rawPage);
  const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const where = { deletedAt: null };

  const [items, total] = await prisma.$transaction([
    prisma.dimension.findMany({
      where,
      orderBy: { id: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.dimension.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
};

export const getDimensionById = async (id: number) =>
  prisma.dimension.findFirst({ where: { id, deletedAt: null } });
