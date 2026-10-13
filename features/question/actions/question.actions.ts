"use server";

import type { Question } from "@/generated/prisma/client";
import { prisma } from "@/shared/lib/prisma";
import { result } from "@/shared/lib/result";
import { getSession } from "@/shared/lib/session";
import { ActionResult } from "@/shared/types/action-result";
import { revalidatePath } from "next/cache";
import { QuestionBody, QuestionIdSchema } from "../schemas/question.schema";

const LIST_PATH = "/panel/questions";

const detailPath = (id: number) => `${LIST_PATH}/${id}`;

const normalize = (body: QuestionBody) => ({
  text: body.text.trim(),
  description: body.description?.trim() || null,
  dimensionId: body.dimensionId,
  type: body.type,
  options: body.options
    .map((option) => ({ text: option.text.trim(), value: option.value }))
    .filter((option) => option.text.length > 0),
});

const dimensionExists = async (dimensionId: number) =>
  (await prisma.dimension.count({
    where: { id: dimensionId, deletedAt: null },
  })) > 0;

export const createQuestion = async (
  body: QuestionBody,
): Promise<ActionResult<Question>> => {
  const session = await getSession();
  if (!session) return result.fail("No autorizado");

  const data = normalize(body);

  if (!(await dimensionExists(data.dimensionId)))
    return result.fail("La dimensión seleccionada no existe");

  const question = await prisma.$transaction(async (tx) => {
    const created = await tx.question.create({
      data: {
        text: data.text,
        description: data.description,
        dimensionId: data.dimensionId,
        type: data.type,
      },
    });

    if (data.options.length > 0)
      await tx.questionOption.createMany({
        data: data.options.map((option) => ({
          questionId: created.id,
          text: option.text,
          value: option.value,
        })),
      });

    return created;
  });

  revalidatePath(LIST_PATH);
  return result.ok(question, "Pregunta creada correctamente");
};

export const updateQuestion = async (
  id: number,
  body: QuestionBody,
): Promise<ActionResult<Question>> => {
  const session = await getSession();
  if (!session) return result.fail("No autorizado");

  const parsedId = QuestionIdSchema.safeParse(id);
  if (!parsedId.success) return result.fail("Identificador inválido");

  const existing = await prisma.question.findFirst({
    where: { id: parsedId.data, deletedAt: null },
  });
  if (!existing) return result.fail("La pregunta no existe");

  const data = normalize(body);

  if (!(await dimensionExists(data.dimensionId)))
    return result.fail("La dimensión seleccionada no existe");

  const question = await prisma.$transaction(async (tx) => {
    const updated = await tx.question.update({
      where: { id: parsedId.data },
      data: {
        text: data.text,
        description: data.description,
        dimensionId: data.dimensionId,
        type: data.type,
      },
    });

    await tx.questionOption.deleteMany({ where: { questionId: parsedId.data } });

    if (data.options.length > 0)
      await tx.questionOption.createMany({
        data: data.options.map((option) => ({
          questionId: parsedId.data,
          text: option.text,
          value: option.value,
        })),
      });

    return updated;
  });

  revalidatePath(LIST_PATH);
  revalidatePath(detailPath(parsedId.data));
  return result.ok(question, "Pregunta actualizada correctamente");
};

export const deleteQuestion = async (
  id: number,
): Promise<ActionResult<undefined>> => {
  const session = await getSession();
  if (!session) return result.fail("No autorizado");

  const parsedId = QuestionIdSchema.safeParse(id);
  if (!parsedId.success) return result.fail("Identificador inválido");

  const existing = await prisma.question.findFirst({
    where: { id: parsedId.data, deletedAt: null },
  });
  if (!existing) return result.fail("La pregunta no existe");

  await prisma.question.update({
    where: { id: parsedId.data },
    data: { deletedAt: new Date() },
  });

  revalidatePath(LIST_PATH);
  return result.success("Pregunta eliminada correctamente");
};
