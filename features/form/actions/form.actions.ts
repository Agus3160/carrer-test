"use server";

import { prisma } from "@/shared/lib/prisma";
import { result } from "@/shared/lib/result";
import type { ActionResult } from "@/shared/types/action-result";
import { computeCareerScores, computeDimensionScores } from "../lib/scoring";
import type {
  AnswerPayload,
  AnswersMap,
  CandidateInfo,
  CareerResult,
  ExistingCandidate,
  FormQuestion,
} from "../lib/types";
import {
  CandidateSchema,
  SubmitAssessmentSchema,
  type SubmitAssessmentBody,
} from "../schemas/form.schema";

const normalizeEmail = (email: string) => email.trim().toLowerCase();
const normalizeCi = (ci: string) => ci.trim();

export const findCandidate = async (
  info: CandidateInfo,
): Promise<ActionResult<ExistingCandidate | null>> => {
  const parsed = CandidateSchema.safeParse(info);
  if (!parsed.success)
    return result.fail(
      "Datos del candidato inválidos",
      parsed.error.issues.map((issue) => issue.message),
    );

  const ci = normalizeCi(parsed.data.ci);
  const email = normalizeEmail(parsed.data.email);

  const candidate = await prisma.candidate.findFirst({
    where: { deletedAt: null, OR: [{ ci }, { email }] },
    include: {
      assessments: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: {
          results: {
            orderBy: { score: "desc" },
            include: { career: { select: { name: true } } },
          },
        },
      },
    },
  });

  if (!candidate) return result.ok(null);

  const last = candidate.assessments[0] ?? null;

  return result.ok({
    id: candidate.id,
    name: candidate.name,
    ci: candidate.ci,
    email: candidate.email,
    lastAssessmentAt: last?.createdAt ?? null,
    results:
      last?.results.map((item) => ({
        careerName: item.career.name,
        score: Math.round(item.score),
      })) ?? [],
  });
};

const buildAnswersMap = (
  questions: FormQuestion[],
  answers: AnswerPayload[],
): AnswersMap => {
  const questionsById = new Map(questions.map((question) => [question.id, question]));
  const map: AnswersMap = {};

  for (const answer of answers) {
    const question = questionsById.get(answer.questionId);
    if (!question) continue;

    const validOptionIds = new Set(question.options.map((option) => option.id));
    const validSelections = answer.optionIds.filter((id) => validOptionIds.has(id));

    switch (question.type) {
      case "SINGLE_CHOICE":
      case "SCALE":
        map[question.id] = {
          type: question.type,
          optionId: validSelections[0] ?? null,
        };
        break;
      case "MULTIPLE_CHOICE":
        map[question.id] = { type: "MULTIPLE_CHOICE", optionIds: validSelections };
        break;
      case "TEXT":
        map[question.id] = { type: "TEXT", text: answer.text?.trim() ?? "" };
        break;
    }
  }

  return map;
};

const buildAnswerRows = (
  questions: FormQuestion[],
  answersMap: AnswersMap,
): {
  questionId: number;
  questionOptionId: number | null;
  value: number | null;
  text: string | null;
}[] => {
  const rows: {
    questionId: number;
    questionOptionId: number | null;
    value: number | null;
    text: string | null;
  }[] = [];

  const questionById = new Map(questions.map((question) => [question.id, question]));

  for (const [questionId, answer] of Object.entries(answersMap)) {
    const question = questionById.get(Number(questionId));
    if (!question) continue;

    if (answer.type === "TEXT") {
      if (answer.text.trim().length > 0)
        rows.push({
          questionId: question.id,
          questionOptionId: null,
          value: null,
          text: answer.text.trim(),
        });
      continue;
    }

    const optionIds =
      answer.type === "MULTIPLE_CHOICE"
        ? answer.optionIds
        : answer.optionId !== null
          ? [answer.optionId]
          : [];

    for (const optionId of optionIds)
      rows.push({
        questionId: question.id,
        questionOptionId: optionId,
        value: null,
        text: null,
      });
  }

  return rows;
};

export const submitAssessment = async (
  body: SubmitAssessmentBody,
): Promise<ActionResult<CareerResult[]>> => {
  const parsed = SubmitAssessmentSchema.safeParse(body);
  if (!parsed.success)
    return result.fail(
      "Respuestas inválidas",
      parsed.error.issues.map((issue) => issue.message),
    );

  const questions = await prisma.question.findMany({
    where: { deletedAt: null, dimension: { deletedAt: null } },
    orderBy: [{ dimensionId: "asc" }, { id: "asc" }],
    include: {
      dimension: { select: { id: true, name: true } },
      options: { select: { id: true, text: true, value: true } },
    },
  });

  if (questions.length === 0)
    return result.fail("No hay preguntas disponibles para el test");

  const careers = await prisma.career.findMany({
    where: { deletedAt: null },
    include: {
      careerDimensions: {
        where: { dimension: { deletedAt: null } },
        select: { dimensionId: true, weight: true },
      },
    },
  });

  if (careers.length === 0)
    return result.fail("No hay carreras configuradas para calcular resultados");

  const scoringQuestions: FormQuestion[] = questions.map((question) => ({
    id: question.id,
    text: question.text,
    description: question.description,
    type: question.type,
    dimension: {
      id: question.dimension.id,
      name: question.dimension.name,
    },
    options: question.options.map((option) => ({
      id: option.id,
      text: option.text,
      value: option.value,
    })),
  }));

  const answersMap = buildAnswersMap(scoringQuestions, parsed.data.answers);
  const answerRows = buildAnswerRows(scoringQuestions, answersMap);

  const dimensionScores = computeDimensionScores(scoringQuestions, answersMap);
  const careerResults = computeCareerScores(
    careers.map((career) => ({
      id: career.id,
      name: career.name,
      description: career.description,
      careerDimensions: career.careerDimensions,
    })),
    dimensionScores,
  );

  const ci = normalizeCi(parsed.data.candidate.ci);
  const email = normalizeEmail(parsed.data.candidate.email);
  const name = parsed.data.candidate.name?.trim() || null;

  await prisma.$transaction(async (tx) => {
    const existing = await tx.candidate.findFirst({
      where: { OR: [{ ci }, { email }] },
    });

    const candidate = existing
      ? await tx.candidate.update({
          where: { id: existing.id },
          data: { name, ci, email, deletedAt: null },
        })
      : await tx.candidate.create({ data: { name, ci, email } });

    const assessment = await tx.assessment.create({
      data: {
        candidateId: candidate.id,
        completedAt: new Date(),
        answers: { create: answerRows },
      },
    });

    await tx.result.createMany({
      data: careerResults.map((career) => ({
        assessmentId: assessment.id,
        careerId: career.careerId,
        score: career.score,
        description: career.description,
      })),
    });
  });

  return result.ok(careerResults, "Test completado correctamente");
};
