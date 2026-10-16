"use server";

import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/shared/lib/prisma";
import { result } from "@/shared/lib/result";
import type { ActionResult } from "@/shared/types/action-result";
import { applyJevProbabilities, buildKnowledgeEvidence } from "../lib/evidence";
import { JevRecommendationError, requestJevCareerDistribution } from "../lib/jev";
import type {
  AnswerPayload,
  AnswersMap,
  CareerKnowledgeProfile,
  CareerResult,
  FormQuestion,
} from "../lib/types";
import { SubmitAssessmentSchema, type SubmitAssessmentBody } from "../schemas/form.schema";

const QUESTIONNAIRE_VERSION = "vocacional-v1";

const buildAnswersMap = (
  questions: FormQuestion[],
  answers: AnswerPayload[],
): AnswersMap => {
  const byId = new Map(questions.map((question) => [question.id, question]));
  const map: AnswersMap = {};

  for (const answer of answers) {
    const question = byId.get(answer.questionId);
    if (!question) throw new Error("La pregunta enviada ya no está disponible");
    const allowed = new Set(question.options.map((option) => option.id));
    if (answer.optionIds.some((id) => !allowed.has(id)))
      throw new Error("Una respuesta no pertenece a su pregunta");
    if (
      (question.type === "SINGLE_CHOICE" || question.type === "SCALE") &&
      answer.optionIds.length !== 1
    )
      throw new Error("Selecciona una opción por pregunta");
    if (question.type === "MULTIPLE_CHOICE" && answer.optionIds.length === 0)
      throw new Error("Selecciona al menos una opción por pregunta");
    if (question.type === "TEXT" && !answer.text?.trim())
      throw new Error("Completa todas las respuestas antes de continuar");

    switch (question.type) {
      case "SINGLE_CHOICE":
        map[question.id] = {
          type: question.type,
          optionId: answer.optionIds[0] ?? null,
        };
        break;
      case "SCALE":
        map[question.id] = {
          type: question.type,
          optionId: answer.optionIds[0] ?? null,
        };
        break;
      case "MULTIPLE_CHOICE":
        map[question.id] = { type: question.type, optionIds: answer.optionIds };
        break;
      case "TEXT":
        map[question.id] = { type: "TEXT", text: answer.text?.trim() ?? "" };
        break;
    }
  }
  return map;
};

const buildAnswerRows = (questions: FormQuestion[], answers: AnswersMap) => {
  const byId = new Map(questions.map((question) => [question.id, question]));
  const rows: {
    questionId: number;
    questionOptionId: number | null;
    value: number | null;
    text: string | null;
  }[] = [];

  for (const [rawQuestionId, answer] of Object.entries(answers)) {
    const question = byId.get(Number(rawQuestionId));
    if (!question) continue;
    if (answer.type === "TEXT") {
      if (answer.text.trim())
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
        : answer.optionId === null
          ? []
          : [answer.optionId];
    for (const optionId of optionIds) {
      const option = question.options.find((item) => item.id === optionId);
      if (!option) continue;
      rows.push({
        questionId: question.id,
        questionOptionId: option.id,
        value: option.value,
        text: null,
      });
    }
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

  try {
    const questionsDb = await prisma.question.findMany({
      where: {
        deletedAt: null,
        seedKey: { not: null },
        dimension: { deletedAt: null },
      },
      orderBy: [{ dimensionId: "asc" }, { id: "asc" }],
      include: {
        dimension: { select: { id: true, name: true } },
        options: { select: { id: true, text: true, value: true, conceptCodes: true } },
      },
    });
    if (!questionsDb.length)
      return result.fail("Todavía no hay preguntas configuradas para comparar carreras");

    const questions: FormQuestion[] = questionsDb.map((question) => ({
      id: question.id,
      text: question.text,
      description: question.description,
      type: question.type,
      kind: question.kind,
      dimension: { id: question.dimension.id, name: question.dimension.name },
      options: question.options,
    }));

    const submittedIds = parsed.data.answers.map((answer) => answer.questionId);
    if (new Set(submittedIds).size !== submittedIds.length)
      return result.fail("Se recibió más de una respuesta para la misma pregunta");
    if (
      submittedIds.length !== questions.length ||
      questions.some((question) => !submittedIds.includes(question.id))
    )
      return result.fail("Completa todas las preguntas antes de ver tus recomendaciones");
    const answersMap = buildAnswersMap(questions, parsed.data.answers);
    const answerRows = buildAnswerRows(questions, answersMap);

    const careersDb = await prisma.career.findMany({
      where: {
        deletedAt: null,
        courses: { some: {} },
        knowledgeLinks: { some: {} },
      },
      orderBy: { name: "asc" },
      include: {
        knowledgeLinks: {
          include: {
            concept: { select: { code: true, label: true, type: true } },
          },
        },
        courses: {
          orderBy: [{ semester: "asc" }, { name: "asc" }],
          select: {
            name: true,
            conceptCodes: true,
            sourceName: true,
            sourceUrl: true,
            sourceVersion: true,
          },
        },
      },
    });
    if (!careersDb.length)
      return result.fail("Todavía no hay carreras disponibles para recomendar");

    const careers: CareerKnowledgeProfile[] = careersDb.map((career) => ({
      id: career.id,
      name: career.name,
      description: career.description,
      knowledgeLinks: career.knowledgeLinks,
      courses: career.courses,
    }));
    const evidence = buildKnowledgeEvidence(careers, questions, answersMap);
    const jev = await requestJevCareerDistribution(careers, questions, answersMap);
    const recommendations = applyJevProbabilities(evidence, jev.probabilities);
    const name = parsed.data.candidate.name?.trim() || null;

    await prisma.$transaction(async (tx) => {
      const candidate = await tx.candidate.create({ data: { name } });
      const assessment = await tx.assessment.create({
        data: {
          candidateId: candidate.id,
          completedAt: new Date(),
          questionnaireVersion: QUESTIONNAIRE_VERSION,
          recommendationVersion: jev.recommendationVersion,
          answers: { create: answerRows },
        },
      });
      await tx.result.createMany({
        data: recommendations.map((recommendation) => ({
          assessmentId: assessment.id,
          careerId: recommendation.careerId,
          score: null,
          jevProbability: recommendation.jevProbability,
          rank: recommendation.rank,
          coverage: recommendation.coverage,
          matchedConceptCodes: recommendation.matchedConceptCodes,
          evidence: recommendation.evidence as unknown as Prisma.InputJsonValue,
          gaps: recommendation.opportunities,
          recommendationVersion: jev.recommendationVersion,
          description: recommendation.summary,
        })),
      });
    });

    return result.ok(recommendations, "Orientación completada");
  } catch (error) {
    if (error instanceof JevRecommendationError)
      return result.fail(error.message);
    if (error instanceof Error)
      return result.fail(error.message || "No se pudo guardar la orientación");
    return result.fail("No se pudo guardar la orientación");
  }
};
