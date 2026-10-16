import "server-only";

import { createHash, randomBytes } from "crypto";
import { cache } from "react";
import { env } from "./env";
import { prisma } from "./prisma";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { redirect } from "next/navigation";

export const genCode = () => randomBytes(32).toString("hex");

export const hashCode = (token: string) =>
  createHash("sha256")
    .update(token + env.SESSION_SECRET)
    .digest("hex");

export const createSession = async (userId: string) => {
  const code = genCode();
  const hash = hashCode(code);
  const expiresAt = new Date(Date.now() + env.SESSION_TTL_MS);

  await prisma.session.create({
    data: {
      id: hash,
      userId,
      expiresAt,
    },
  });

  const store = await cookies();

  store.set(env.SESSION_COOKIE_NAME, code, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: env.SESSION_TTL_MS / 1000,
  });
};

export const logout = async () => {
  const store = await cookies();
  const code = store.get(env.SESSION_COOKIE_NAME)?.value;

  if (code)
    await prisma.session.updateMany({
      where: { id: hashCode(code), revokedAt: null },
      data: { revokedAt: new Date() },
    });

  store.delete(env.SESSION_COOKIE_NAME);
};

export const isThereSession = async (req: NextRequest) => {
  const session = req.cookies.get(env.SESSION_COOKIE_NAME)?.value;
  return session !== null;
};

export const getSession = cache(async () => {
  const store = await cookies();
  const code = store.get(env.SESSION_COOKIE_NAME)?.value;
  if (!code) return null;

  const hash = hashCode(code);
  const session = await prisma.session.findUnique({ where: { id: hash } });
  if (!session || session.expiresAt < new Date() || session.revokedAt !== null)
    return null;

  return session;
});

export const getSessionOrRedirect = async () => {
  const session = await getSession();
  if (!session) return redirect("/auth/signin");
  return session;
};
