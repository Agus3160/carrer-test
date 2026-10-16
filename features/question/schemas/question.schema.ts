import { idSchema } from "@/shared/lib/validation";
import { isChoiceQuestionType, QuestionTypeValues } from "../lib/form.utils";
import z from "zod";

export const QuestionTypeSchema = z.enum(
  QuestionTypeValues,
  "El tipo es requerido",
);

export const QuestionOptionSchema = z.object({
  text: z
    .string("El texto de la opción es requerido")
    .min(1, "El texto de la opción es requerido")
    .max(300, "El texto de la opción no puede superar los 300 caracteres"),
  value: z
    .number("El valor es requerido")
    .min(-1, "El valor no puede ser menor a -1")
    .max(1000, "El valor no puede superar 1000"),
});

export const QuestionSchema = z
  .object({
    text: z
      .string("El enunciado es requerido")
      .min(3, "El enunciado debe tener al menos 3 caracteres")
      .max(500, "El enunciado no puede superar los 500 caracteres"),
    description: z
      .string()
      .max(500, "La descripción no puede superar los 500 caracteres")
      .optional(),
    dimensionId: z
      .number("La dimensión es requerida")
      .int("La dimensión es inválida")
      .positive("La dimensión es inválida"),
    type: QuestionTypeSchema,
    options: z.array(QuestionOptionSchema),
  })
  .superRefine((data, ctx) => {
    if (isChoiceQuestionType(data.type) && data.options.length < 2)
      ctx.addIssue({
        code: "custom",
        message: "Debes agregar al menos 2 opciones",
        path: ["options"],
      });
  });

export type QuestionOptionBody = z.infer<typeof QuestionOptionSchema>;
export type QuestionBody = z.infer<typeof QuestionSchema>;

export const QuestionIdSchema = idSchema;
