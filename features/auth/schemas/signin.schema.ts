import z from "zod";

export const SigninSchema = z.object({
  email: z.email("Correo inválido"),
  password: z
    .string("Contraseña requerida")
    .min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export type SigninBody = z.infer<typeof SigninSchema>;
