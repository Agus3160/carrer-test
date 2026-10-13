"server only";

import { prisma } from "@/shared/lib/prisma";
import { getPaginationMeta, resolvePagination } from "@/shared/lib/pagination";
import { getSessionOrRedirect } from "@/shared/lib/session";
import type { Career } from "@/generated/prisma/client";
import { Paginated } from "@/shared/types/paginated";

export type CareerListItem = Career & {
  _count: { careerDimensions: number };
};

export const getCareersPage = async (
  rawPage: unknown,
): Promise<Paginated<CareerListItem>> => {
  await getSessionOrRedirect();

  const { page, pageSize, skip, take } = resolvePagination(rawPage);
  const where = { deletedAt: null };

  const [items, total] = await prisma.$transaction([
    prisma.career.findMany({
      where,
      orderBy: { id: "desc" },
      skip,
      take,
      include: { _count: { select: { careerDimensions: true } } },
    }),
    prisma.career.count({ where }),
  ]);

  return { items, ...getPaginationMeta(total, { page, pageSize }) };
};

export const getCareerById = async (id: number) => {
  await getSessionOrRedirect();
  return prisma.career.findFirst({
    where: { id, deletedAt: null },
    include: {
      careerDimensions: {
        include: { dimension: true },
        orderBy: { dimensionId: "asc" },
      },
    },
  });
};

export type CareerDetail = NonNullable<Awaited<ReturnType<typeof getCareerById>>>;
