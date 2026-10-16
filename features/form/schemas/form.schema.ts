import z from "zod";
import { idSchema } from "@/shared/lib/validation";

export const CandidateSchema = z.object({
  name: z.string().max(120, "El nombre no debe superar los 120 caracteres").optional().or(z.literal("")),
});

export const SubmitAnswerSchema = z.object({
  questionId: idSchema,
  optionIds: z.array(idSchema).max(20).default([]),
  value: z.number().nullable().default(null),
  text: z.string().max(2000).nullable().default(null),
});

export const SubmitAssessmentSchema = z.object({
  candidate: CandidateSchema.default({}),
  answers: z.array(SubmitAnswerSchema).max(100),
});

export type CandidateBody = z.infer<typeof CandidateSchema>;
export type SubmitAnswerBody = z.infer<typeof SubmitAnswerSchema>;
export type SubmitAssessmentBody = z.infer<typeof SubmitAssessmentSchema>;
