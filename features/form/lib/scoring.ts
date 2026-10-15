import type {
  AnswersMap,
  CareerResult,
  CareerWithWeights,
  FormQuestion,
} from "./types";

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const normalizeChoice = (
  question: FormQuestion,
  answer: AnswersMap[number],
): number | null => {
  if (
    answer?.type !== "SINGLE_CHOICE" &&
    answer?.type !== "SCALE"
  )
    return null;

  if (answer.optionId === null) return null;

  const option = question.options.find((item) => item.id === answer.optionId);
  if (!option) return null;

  const values = question.options.map((item) => item.value);
  const min = Math.min(...values);
  const max = Math.max(...values);

  if (max === min) return 100;

  return clamp(((option.value - min) / (max - min)) * 100, 0, 100);
};

const normalizeMultiple = (
  question: FormQuestion,
  answer: AnswersMap[number],
): number | null => {
  if (answer?.type !== "MULTIPLE_CHOICE") return null;
  if (answer.optionIds.length === 0) return null;

  const positiveTotal = question.options.reduce(
    (total, option) => total + Math.max(0, option.value),
    0,
  );
  if (positiveTotal === 0) return 100;

  const selectedTotal = question.options
    .filter((option) => answer.optionIds.includes(option.id))
    .reduce((total, option) => total + Math.max(0, option.value), 0);

  return clamp((selectedTotal / positiveTotal) * 100, 0, 100);
};

export const normalizeAnswer = (
  question: FormQuestion,
  answer: AnswersMap[number],
): number | null => {
  if (question.type === "TEXT") return null;
  if (question.options.length === 0) return null;
  if (question.type === "MULTIPLE_CHOICE") return normalizeMultiple(question, answer);
  return normalizeChoice(question, answer);
};

export const computeDimensionScores = (
  questions: FormQuestion[],
  answers: AnswersMap,
): Map<number, number> => {
  const accumulator = new Map<number, { total: number; count: number }>();

  for (const question of questions) {
    const normalized = normalizeAnswer(question, answers[question.id]);
    if (normalized === null) continue;

    const current = accumulator.get(question.dimension.id) ?? {
      total: 0,
      count: 0,
    };
    current.total += normalized;
    current.count += 1;
    accumulator.set(question.dimension.id, current);
  }

  const scores = new Map<number, number>();
  for (const [dimensionId, { total, count }] of accumulator)
    scores.set(dimensionId, count > 0 ? total / count : 0);

  return scores;
};

export const computeCareerScores = (
  careers: CareerWithWeights[],
  dimensionScores: Map<number, number>,
): CareerResult[] =>
  careers
    .map((career) => {
      let weightedTotal = 0;
      let weightSum = 0;

      for (const relation of career.careerDimensions) {
        const dimensionScore = dimensionScores.get(relation.dimensionId) ?? 0;
        weightedTotal += relation.weight * dimensionScore;
        weightSum += relation.weight;
      }

      const raw = weightSum > 0 ? weightedTotal / weightSum : 0;

      return {
        careerId: career.id,
        careerName: career.name,
        score: clamp(Math.round(raw), 1, 100),
        description: career.description,
      };
    })
    .sort((a, b) => b.score - a.score);
