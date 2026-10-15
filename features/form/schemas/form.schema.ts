import z from "zod";
import { idSchema } from "@/shared/lib/validation";

export const CandidateSchema = z.object({
  name: z
    .string("El nombre es requerido")
    .max(120, "El nombre no debe superar los 120 caracteres")
    .optional()
    .or(z.literal("")),
  ci: z
    .string("La cédula es requerida")
    .min(3, "La cédula debe tener al menos 3 caracteres")
    .max(30, "La cédula no debe superar los 30 caracteres"),
  email: z.email("Correo inválido"),
});

export const SubmitAnswerSchema = z.object({
  questionId: idSchema,
  optionIds: z.array(idSchema).default([]),
  value: z.number().nullable().default(null),
  text: z.string().max(2000).nullable().default(null),
});

export const SubmitAssessmentSchema = z.object({
  candidate: CandidateSchema,
  answers: z.array(SubmitAnswerSchema),
});

export type CandidateBody = z.infer<typeof CandidateSchema>;
export type SubmitAnswerBody = z.infer<typeof SubmitAnswerSchema>;
export type SubmitAssessmentBody = z.infer<typeof SubmitAssessmentSchema>;
