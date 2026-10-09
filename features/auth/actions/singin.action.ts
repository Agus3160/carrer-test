"use server";

import { prisma } from "@/shared/lib/prisma";
import { SigninBody } from "../schemas/signin.schema";
import { compare } from "@/shared/lib/password";
import { ActionResult } from "@/shared/types/action-result";
import { result } from "@/shared/lib/result";
import { redirect } from "next/navigation";
import { createSession } from "@/shared/lib/session";

export const signin = async (body: SigninBody): Promise<ActionResult> => {
  const user = await prisma.user.findUnique({ where: { email: body.email } });
  if (!user) return result.fail("Credenciales invalidas");
  const match = await compare(body.password, user.password);
  if (!match) return result.fail("Credenciales invalidas");
  await createSession(user.id);
  redirect("/panel");
};
