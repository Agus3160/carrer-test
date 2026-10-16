import "server-only";

import { prisma } from "@/shared/lib/prisma";
import { getPaginationMeta, resolvePagination } from "@/shared/lib/pagination";
import { getSessionOrRedirect } from "@/shared/lib/session";
import { Dimension } from "@/generated/prisma/client";
import { Paginated } from "@/shared/types/paginated";

export const getDimensionsPage = async (
  rawPage: unknown,
): Promise<Paginated<Dimension>> => {
  await getSessionOrRedirect();

  const { page, pageSize, skip, take } = resolvePagination(rawPage);
  const where = { deletedAt: null };

  const [items, total] = await prisma.$transaction([
    prisma.dimension.findMany({
      where,
      orderBy: { id: "desc" },
      skip,
      take,
    }),
    prisma.dimension.count({ where }),
  ]);

  return { items, ...getPaginationMeta(total, { page, pageSize }) };
};

export const getDimensionById = async (id: number) => {
  await getSessionOrRedirect();
  return prisma.dimension.findFirst({ where: { id, deletedAt: null } });
};

export const getAllDimensions = async () => {
  await getSessionOrRedirect();
  return prisma.dimension.findMany({
    where: { deletedAt: null },
    orderBy: { name: "asc" },
  });
};
