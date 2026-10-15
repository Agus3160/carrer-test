import type { QuestionType } from "@/generated/prisma/enums";

export type FormPhase = 0 | 1 | 3 | 4;

export type FormOption = {
  id: number;
  text: string;
  value: number;
};

export type FormQuestion = {
  id: number;
  text: string;
  description: string | null;
  type: QuestionType;
  dimension: { id: number; name: string };
  options: FormOption[];
};

export type FormDimensionGroup = {
  id: number;
  name: string;
  questions: FormQuestion[];
};

export type CandidateInfo = {
  name: string;
  ci: string;
  email: string;
};

export type AnswerValue =
  | { type: "SINGLE_CHOICE"; optionId: number | null }
  | { type: "MULTIPLE_CHOICE"; optionIds: number[] }
  | { type: "SCALE"; optionId: number | null }
  | { type: "TEXT"; text: string };

export type AnswersMap = Record<number, AnswerValue>;

export type ExistingResult = {
  careerName: string;
  score: number;
};

export type ExistingCandidate = {
  id: string;
  name: string | null;
  ci: string;
  email: string;
  lastAssessmentAt: Date | null;
  results: ExistingResult[];
};

export type CareerResult = {
  careerId: number;
  careerName: string;
  score: number;
  description: string | null;
};

export type CareerWithWeights = {
  id: number;
  name: string;
  description: string | null;
  careerDimensions: { dimensionId: number; weight: number }[];
};

export type AnswerPayload = {
  questionId: number;
  optionIds: number[];
  value: number | null;
  text: string | null;
};
