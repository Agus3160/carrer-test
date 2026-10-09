import z from "zod";
import "dotenv/config";

const EnvSchema = z.object({
  DATABASE_URL: z.string().nonempty(),

  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  SESSION_SECRET: z.string().nonempty().default("secret"),
  SESSION_COOKIE_NAME: z.string().nonempty().default("session"),
  SESSION_TTL_MS: z.coerce
    .number()
    .int()
    .default(60 * 60 * 24 * 30),
});

export const env = EnvSchema.parse(process.env);
