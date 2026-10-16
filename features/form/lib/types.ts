import type { QuestionKind, QuestionType } from "@/generated/prisma/enums";

export type FormPhase = 0 | 1 | 3 | 4;

export type FormOption = {
  id: number;
  text: string;
  value: number;
  conceptCodes: string[];
};

export type FormQuestion = {
  id: number;
  text: string;
  description: string | null;
  type: QuestionType;
  kind: QuestionKind;
  dimension: { id: number; name: string };
  options: FormOption[];
};

export type FormDimensionGroup = {
  id: number;
  name: string;
  questions: FormQuestion[];
};

export type CandidateInfo = { name: string };

export type AnswerValue =
  | { type: "SINGLE_CHOICE"; optionId: number | null }
  | { type: "MULTIPLE_CHOICE"; optionIds: number[] }
  | { type: "SCALE"; optionId: number | null }
  | { type: "TEXT"; text: string };

export type AnswersMap = Record<number, AnswerValue>;

export type RecommendationEvidence = {
  conceptCode: string;
  label: string;
  kind: QuestionKind;
  response: string;
  relation: "coincide" | "explorar";
  rationale: string;
  courseNames: string[];
  sourceName: string | null;
  sourceUrl: string | null;
};

export type RecommendationSource = {
  name: string;
  url: string;
  version: string | null;
};

export type CareerResult = {
  careerId: number;
  careerName: string;
  description: string | null;
  rank: number;
  jevProbability: number;
  coverage: number;
  coverageLabel: "Amplia" | "Moderada" | "Inicial";
  summary: string;
  evidence: RecommendationEvidence[];
  opportunities: string[];
  courses: string[];
  sources: RecommendationSource[];
  matchedConceptCodes: string[];
};

export type AnswerPayload = {
  questionId: number;
  optionIds: number[];
  value: number | null;
  text: string | null;
};

export type CareerKnowledgeProfile = {
  id: number;
  name: string;
  description: string | null;
  knowledgeLinks: {
    relevance: number;
    rationale: string;
    sourceName: string | null;
    sourceUrl: string | null;
    concept: {
      code: string;
      label: string;
      type: string;
    };
  }[];
  courses: {
    name: string;
    conceptCodes: string[];
    sourceName: string;
    sourceUrl: string;
    sourceVersion: string;
  }[];
};
