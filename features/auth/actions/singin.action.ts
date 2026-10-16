"use server";

import { prisma } from "@/shared/lib/prisma";
import { SigninBody } from "../schemas/signin.schema";
import { compare } from "@/shared/lib/password";
import { ActionResult } from "@/shared/types/action-result";
import { result } from "@/shared/lib/result";
import { redirect } from "next/navigation";
import { createSession } from "@/shared/lib/session";
import { SigninSchema } from "../schemas/signin.schema";

export const signin = async (body: SigninBody): Promise<ActionResult> => {
  const parsedBody = SigninSchema.safeParse(body);
  if (!parsedBody.success) return result.fail("Credenciales inválidas");

  const user = await prisma.user.findUnique({
    where: { email: parsedBody.data.email.trim().toLowerCase() },
  });
  if (!user) return result.fail("Credenciales invalidas");
  const match = await compare(parsedBody.data.password, user.password);
  if (!match) return result.fail("Credenciales invalidas");
  await createSession(user.id);
  redirect("/panel");
};
