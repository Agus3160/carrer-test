import z from "zod";
import { idSchema } from "@/shared/lib/validation";

export const CareerDimensionInputSchema = z.object({
  dimensionId: idSchema,
  weight: z.coerce
    .number("El peso es requerido")
    .min(0, "El peso no puede ser negativo")
    .max(100, "El peso no puede superar 100"),
});

export const CareerSchema = z.object({
  name: z
    .string("El nombre es requerido")
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(120, "El nombre no puede superar los 120 caracteres"),
  description: z
    .string()
    .max(500, "La descripción no puede superar los 500 caracteres")
    .optional(),
  dimensions: z.array(CareerDimensionInputSchema).default([]),
});

export type CareerBody = z.infer<typeof CareerSchema>;

export const CareerIdSchema = idSchema;
