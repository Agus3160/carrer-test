import { QuestionType } from "@/generated/prisma/enums";

export const QuestionTypeValues = [
  "SINGLE_CHOICE",
  "MULTIPLE_CHOICE",
  "SCALE",
  "TEXT",
] as const satisfies readonly QuestionType[];

export const QuestionTypesLabels: Record<QuestionType, string> = {
  SINGLE_CHOICE: "Opción única",
  MULTIPLE_CHOICE: "Opción múltiple",
  SCALE: "Escala",
  TEXT: "Texto",
};

export const QuestionTypeItems = QuestionTypeValues.map((value) => ({
  value,
  label: QuestionTypesLabels[value],
}));

export const ChoiceQuestionTypes = [
  "SINGLE_CHOICE",
  "MULTIPLE_CHOICE",
  "SCALE",
] as const satisfies readonly QuestionType[];

export const isChoiceQuestionType = (type: QuestionType) =>
  (ChoiceQuestionTypes as readonly QuestionType[]).includes(type);
