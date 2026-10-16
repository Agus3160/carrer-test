import "server-only";

import { prisma } from "@/shared/lib/prisma";
import type { FormQuestion } from "../lib/types";

export const getActiveQuestions = async (): Promise<FormQuestion[]> => {
  const questions = await prisma.question.findMany({
    where: {
      deletedAt: null,
      seedKey: { not: null },
      dimension: { deletedAt: null },
    },
    orderBy: [{ dimensionId: "asc" }, { id: "asc" }],
    include: {
      dimension: { select: { id: true, name: true } },
      options: {
        orderBy: { id: "asc" },
        select: { id: true, text: true, value: true, conceptCodes: true },
      },
    },
  });

  return questions.map((question) => ({
    id: question.id,
    text: question.text,
    description: question.description,
    type: question.type,
    kind: question.kind,
    dimension: { id: question.dimension.id, name: question.dimension.name },
    options: question.options.map((option) => ({
      id: option.id,
      text: option.text,
      value: option.value,
      conceptCodes: option.conceptCodes,
    })),
  }));
};
