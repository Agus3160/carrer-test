import { createHash, randomBytes } from "crypto";
import { env } from "./env";
import { prisma } from "./prisma";
import { cookies } from "next/headers";

export const genCode = () => randomBytes(32).toString("hex");

export const hashCode = (token: string) =>
  createHash("sha256")
    .update(token + env.SESSION_SECRET)
    .digest("hex");

export const createSession = async (userId: string) => {
  const code = genCode();
  const hash = hashCode(code);
  const expiresAt = new Date(Date.now() + env.SESSION_TTL_MS);

  const session = await prisma.session.create({
    data: {
      id: hash,
      userId,
      expiresAt,
    },
  });

  console.log(session.id);

  const store = await cookies();

  store.set(env.SESSION_COOKIE_NAME, code, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: env.SESSION_TTL_MS / 1000,
  });
};

export const getSession = async () => {
  const store = await cookies();
  const code = store.get(env.SESSION_COOKIE_NAME)?.value;
  if (!code) return null;

  const hash = hashCode(code);
  const session = await prisma.session.findUnique({ where: { id: hash } });
  if (!session || session.expiresAt < new Date()) return null;

  return session;
};
