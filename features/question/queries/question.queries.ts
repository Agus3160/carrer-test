import "server-only";

import type { Question } from "@/generated/prisma/client";
import { getPaginationMeta, resolvePagination } from "@/shared/lib/pagination";
import { prisma } from "@/shared/lib/prisma";
import { getSessionOrRedirect } from "@/shared/lib/session";
import type { Paginated } from "@/shared/types/paginated";

export type QuestionListItem = Question & {
  dimension: { id: number; name: string };
  _count: { options: number };
};

export const getQuestionsPage = async (
  rawPage: unknown,
): Promise<Paginated<QuestionListItem>> => {
  await getSessionOrRedirect();

  const { page, pageSize, skip, take } = resolvePagination(rawPage);
  const where = { deletedAt: null };

  const [items, total] = await prisma.$transaction([
    prisma.question.findMany({
      where,
      orderBy: { id: "desc" },
      skip,
      take,
      include: {
        dimension: { select: { id: true, name: true } },
        _count: { select: { options: true } },
      },
    }),
    prisma.question.count({ where }),
  ]);

  return { items, ...getPaginationMeta(total, { page, pageSize }) };
};

export const getQuestionById = async (id: number) => {
  await getSessionOrRedirect();

  return prisma.question.findFirst({
    where: { id, deletedAt: null },
    include: {
      dimension: { select: { id: true, name: true } },
      options: { orderBy: { id: "asc" } },
    },
  });
};

export type QuestionDetail = NonNullable<
  Awaited<ReturnType<typeof getQuestionById>>
>;
