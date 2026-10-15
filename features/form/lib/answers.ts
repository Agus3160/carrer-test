import type {
  AnswerPayload,
  AnswerValue,
  AnswersMap,
  FormDimensionGroup,
  FormQuestion,
} from "./types";

export const groupByDimension = (
  questions: FormQuestion[],
): FormDimensionGroup[] => {
  const groups = new Map<number, FormDimensionGroup>();

  for (const question of questions) {
    const group = groups.get(question.dimension.id) ?? {
      id: question.dimension.id,
      name: question.dimension.name,
      questions: [],
    };
    group.questions.push(question);
    groups.set(question.dimension.id, group);
  }

  return [...groups.values()];
};

export const isAnswered = (
  question: FormQuestion,
  answer: AnswerValue | undefined,
): boolean => {
  if (!answer) return false;

  switch (question.type) {
    case "SINGLE_CHOICE":
      return answer.type === "SINGLE_CHOICE" && answer.optionId !== null;
    case "SCALE":
      return answer.type === "SCALE" && answer.optionId !== null;
    case "MULTIPLE_CHOICE":
      return answer.type === "MULTIPLE_CHOICE" && answer.optionIds.length > 0;
    case "TEXT":
      return answer.type === "TEXT" && answer.text.trim().length > 0;
  }
};

export const countAnswered = (
  questions: FormQuestion[],
  answers: AnswersMap,
): number =>
  questions.reduce(
    (total, question) => total + (isAnswered(question, answers[question.id]) ? 1 : 0),
    0,
  );

export const buildAnswersPayload = (
  questions: FormQuestion[],
  answers: AnswersMap,
): AnswerPayload[] =>
  questions.map((question) => {
    const answer = answers[question.id];

    if (
      question.type === "SINGLE_CHOICE" &&
      answer?.type === "SINGLE_CHOICE" &&
      answer.optionId !== null
    )
      return {
        questionId: question.id,
        optionIds: [answer.optionId],
        value: null,
        text: null,
      };

    if (
      question.type === "SCALE" &&
      answer?.type === "SCALE" &&
      answer.optionId !== null
    )
      return {
        questionId: question.id,
        optionIds: [answer.optionId],
        value: null,
        text: null,
      };

    if (question.type === "MULTIPLE_CHOICE" && answer?.type === "MULTIPLE_CHOICE")
      return {
        questionId: question.id,
        optionIds: answer.optionIds,
        value: null,
        text: null,
      };

    if (question.type === "TEXT" && answer?.type === "TEXT")
      return {
        questionId: question.id,
        optionIds: [],
        value: null,
        text: answer.text,
      };

    return { questionId: question.id, optionIds: [], value: null, text: null };
  });
