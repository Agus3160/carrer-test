import z from "zod";

export const DimensionSchema = z.object({
  name: z
    .string("El nombre es requerido")
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(120, "El nombre no puede superar los 120 caracteres"),
  description: z
    .string("La descripción es requerida")
    .min(3, "La descripción debe tener al menos 3 caracteres")
    .max(500, "La descripción no puede superar los 500 caracteres"),
});

export type DimensionBody = z.infer<typeof DimensionSchema>;

export const DimensionIdSchema = z.coerce.number().int().positive();
