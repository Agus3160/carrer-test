import "server-only";

import { prisma } from "@/shared/lib/prisma";
import { getPaginationMeta, resolvePagination } from "@/shared/lib/pagination";
import { getSessionOrRedirect } from "@/shared/lib/session";

export const getCandidatesPage = async (rawPage: unknown) => {
  await getSessionOrRedirect();
  const pagination = resolvePagination(rawPage);
  const where = { deletedAt: null };
  const [items, total] = await prisma.$transaction([
    prisma.candidate.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: pagination.skip,
      take: pagination.take,
      include: {
        _count: { select: { assessments: true } },
        assessments: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            results: {
              orderBy: { rank: "asc" },
              take: 1,
              include: { career: { select: { name: true } } },
            },
          },
        },
      },
    }),
    prisma.candidate.count({ where }),
  ]);
  return { items, ...getPaginationMeta(total, pagination) };
};

export const getAssessmentsPage = async (rawPage: unknown) => {
  await getSessionOrRedirect();
  const pagination = resolvePagination(rawPage);
  const where = { completedAt: { not: null } };
  const [items, total] = await prisma.$transaction([
    prisma.assessment.findMany({
      where,
      orderBy: { completedAt: "desc" },
      skip: pagination.skip,
      take: pagination.take,
      include: {
        candidate: { select: { name: true } },
        results: {
          orderBy: { rank: "asc" },
          take: 3,
          include: { career: { select: { name: true } } },
        },
        _count: { select: { answers: true } },
      },
    }),
    prisma.assessment.count({ where }),
  ]);
  return { items, ...getPaginationMeta(total, pagination) };
};

export const getAssessmentById = async (id: number) => {
  await getSessionOrRedirect();
  return prisma.assessment.findFirst({
    where: { id },
    include: {
      candidate: { select: { name: true } },
      answers: {
        include: {
          question: {
            select: {
              text: true,
              kind: true,
              dimension: { select: { name: true } },
            },
          },
          questionOption: { select: { text: true } },
        },
      },
      results: {
        orderBy: { rank: "asc" },
        include: { career: { select: { name: true } } },
      },
    },
  });
};

export const getKnowledgeLinksPage = async (rawPage: unknown) => {
  await getSessionOrRedirect();
  const pagination = resolvePagination(rawPage);
  const [items, total, conceptCount, courseCount, preliminaryCount] =
    await Promise.all([
      prisma.careerKnowledgeLink.findMany({
        orderBy: [{ career: { name: "asc" } }, { concept: { label: "asc" } }],
        skip: pagination.skip,
        take: pagination.take,
        include: {
          career: { select: { name: true } },
          concept: { select: { label: true, type: true } },
        },
      }),
      prisma.careerKnowledgeLink.count(),
      prisma.knowledgeConcept.count(),
      prisma.careerCourse.count(),
      prisma.careerKnowledgeLink.count({ where: { status: "PRELIMINARY" } }),
    ]);
  return {
    items,
    conceptCount,
    courseCount,
    preliminaryCount,
    ...getPaginationMeta(total, pagination),
  };
};
