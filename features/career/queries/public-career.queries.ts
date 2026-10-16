import "server-only";

import { prisma } from "@/shared/lib/prisma";

export const getPublicCareers = () =>
  prisma.career.findMany({
    where: {
      deletedAt: null,
      courses: { some: {} },
      knowledgeLinks: { some: {} },
    },
    orderBy: { name: "asc" },
    include: {
      courses: { orderBy: [{ semester: "asc" }, { name: "asc" }] },
      knowledgeLinks: {
        where: { status: { in: ["PRELIMINARY", "REVIEWED"] } },
        include: { concept: true },
        orderBy: { concept: { label: "asc" } },
      },
    },
  });

export const getPublicCareerById = (id: number) =>
  prisma.career.findFirst({
    where: {
      id,
      deletedAt: null,
      courses: { some: {} },
      knowledgeLinks: { some: {} },
    },
    include: {
      courses: { orderBy: [{ semester: "asc" }, { name: "asc" }] },
      knowledgeLinks: {
        where: { status: { in: ["PRELIMINARY", "REVIEWED"] } },
        include: { concept: true },
        orderBy: { concept: { label: "asc" } },
      },
    },
  });
