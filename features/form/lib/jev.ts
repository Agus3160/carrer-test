import "server-only";

import z from "zod";
import { env } from "@/shared/lib/env";
import type {
  AnswersMap,
  CareerKnowledgeProfile,
  FormQuestion,
} from "./types";

const JEV_ENDPOINT = "https://api.typesafe.ai/v1/systemone";
const QUESTION_ID = "career_fit";
const RECOMMENDER_VERSION = "jev-choice-v1";

const JevResponseSchema = z.object({
  model: z.string().min(1),
  answers: z.object({
    [QUESTION_ID]: z.object({
      type: z.literal("choice"),
      choice: z.string().min(1),
      confidence: z.number().min(0).max(1),
      probabilities: z.record(z.string(), z.number().min(0).max(1)),
    }),
  }),
});

export class JevRecommendationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "JevRecommendationError";
  }
}

const getSelectedOptions = (
  question: FormQuestion,
  answer: AnswersMap[number] | undefined,
) => {
  if (!answer) return [];
  if (answer.type === "TEXT") return [];
  const optionIds =
    answer.type === "MULTIPLE_CHOICE"
      ? answer.optionIds
      : answer.optionId === null
        ? []
        : [answer.optionId];
  return question.options.filter((option) => optionIds.includes(option.id));
};

const buildJevState = (
  careers: CareerKnowledgeProfile[],
  questions: FormQuestion[],
  answers: AnswersMap,
) => {
  const conceptLabels = new Map(
    careers.flatMap((career) =>
      career.knowledgeLinks.map((link) => [link.concept.code, link.concept.label] as const),
    ),
  );
  const studentProfile: {
    dimension: string;
    question: string;
    response?: string;
    responses?: {
      answer: string;
      conceptCodes: { code: string; label: string }[];
    }[];
  }[] = [];

  for (const question of questions) {
    const answer = answers[question.id];
    if (answer?.type === "TEXT") {
      if (answer.text.trim())
        studentProfile.push({
          dimension: question.dimension.name,
          question: question.text,
          response: answer.text.trim(),
        });
      continue;
    }

    const options = getSelectedOptions(question, answer);
    if (options.length === 0) continue;
    studentProfile.push({
      dimension: question.dimension.name,
      question: question.text,
      responses: options.map((option) => ({
        answer: option.text,
        conceptCodes: option.conceptCodes.map((code) => ({
          code,
          label: conceptLabels.get(code) ?? code,
        })),
      })),
    });
  }

  return {
    purpose:
      "Orientación vocacional exploratoria. Compara preferencias declaradas con áreas de estudio, actividades y estilos de trabajo de las carreras. No infieras capacidad, éxito académico ni satisfacción futura.",
    studentProfile,
    careerProfiles: careers.map((career) => ({
      name: career.name,
      description: career.description,
      knowledgeAreas: career.knowledgeLinks.map((link) => ({
        concept: link.concept.label,
        category: link.concept.type,
        relevance: link.relevance,
        basis: link.rationale,
      })),
      representativeCourses: career.courses.map((course) => course.name),
    })),
  };
};

const careerOptionKey = (careerId: number) => `career_${careerId}`;

export const requestJevCareerDistribution = async (
  careers: CareerKnowledgeProfile[],
  questions: FormQuestion[],
  answers: AnswersMap,
) => {
  if (!env.JEV_API_KEY)
    throw new JevRecommendationError(
      "Falta configurar JEV_API_KEY para preparar las recomendaciones.",
    );
  if (careers.length === 0)
    throw new JevRecommendationError("No hay carreras para comparar.");

  const criteria = Object.fromEntries(
    careers.map((career) => [
      careerOptionKey(career.id),
      `${career.name}. ${career.description ?? ""} Áreas y materias relacionadas: ${career.knowledgeLinks
        .map((link) => link.concept.label)
        .join(", ")}. Asignaturas representativas: ${career.courses
        .map((course) => course.name)
        .join(", ")}.`,
    ]),
  );

  let response: Response;
  try {
    response = await fetch(JEV_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.JEV_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: env.JEV_MODEL,
        state: buildJevState(careers, questions, answers),
        questions: {
          [QUESTION_ID]: {
            type: "choice",
            instructions:
              "¿Qué carrera tiene mayor afinidad relativa con las respuestas declaradas por el estudiante? Compara las opciones usando sus intereses, materias que le atraen, actividades y preferencias de trabajo. Prioriza intereses y temas de estudio. Una autopercepción baja de habilidad actual no es razón para reducir la afinidad: esas habilidades pueden desarrollarse en la carrera. Si varias encajan, distribuye las probabilidades entre ellas según la evidencia. Basa la decisión solo en el perfil y el catálogo proporcionados; no predigas rendimiento, admisión, permanencia ni éxito profesional.",
            criteria,
          },
        },
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });
  } catch {
    throw new JevRecommendationError(
      "No pudimos conectar con JEV. Revisa tu conexión e inténtalo de nuevo.",
    );
  }

  if (response.status === 401 || response.status === 403)
    throw new JevRecommendationError(
      "JEV no aceptó la clave configurada. Revisa JEV_API_KEY.",
    );
  if (response.status === 429)
    throw new JevRecommendationError(
      "JEV está recibiendo muchas solicitudes. Inténtalo de nuevo en un momento.",
    );
  if (!response.ok)
    throw new JevRecommendationError(
      "JEV no pudo preparar las recomendaciones. Inténtalo de nuevo más tarde.",
    );

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new JevRecommendationError("JEV devolvió una respuesta inválida.");
  }

  const parsed = JevResponseSchema.safeParse(payload);
  if (!parsed.success)
    throw new JevRecommendationError("JEV devolvió una respuesta inválida.");

  const answer = parsed.data.answers[QUESTION_ID];
  const expectedKeys = careers.map((career) => careerOptionKey(career.id)).sort();
  const returnedKeys = Object.keys(answer.probabilities).sort();
  const probabilityTotal = Object.values(answer.probabilities).reduce(
    (sum, probability) => sum + probability,
    0,
  );
  if (
    expectedKeys.length !== returnedKeys.length ||
    expectedKeys.some((key, index) => key !== returnedKeys[index]) ||
    Math.abs(probabilityTotal - 1) > 0.02 ||
    !expectedKeys.includes(answer.choice)
  )
    throw new JevRecommendationError(
      "JEV no devolvió una distribución completa para las carreras disponibles.",
    );

  return {
    model: parsed.data.model,
    recommendationVersion: `${RECOMMENDER_VERSION}/${parsed.data.model}`,
    probabilities: new Map(
      careers.map((career) => [
        career.id,
        answer.probabilities[careerOptionKey(career.id)],
      ]),
    ),
  };
};
