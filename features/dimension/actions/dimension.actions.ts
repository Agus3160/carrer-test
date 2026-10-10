"use server";

import type { Dimension } from "@/generated/prisma/client";
import { prisma } from "@/shared/lib/prisma";
import { result } from "@/shared/lib/result";
import { getSession } from "@/shared/lib/session";
import { ActionResult } from "@/shared/types/action-result";
import { revalidatePath } from "next/cache";
import {
  DimensionBody,
  DimensionIdSchema,
  DimensionSchema,
} from "../schemas/dimension.schema";

const LIST_PATH = "/panel/dimension";

const detailPath = (id: number) => `${LIST_PATH}/${id}`;

export const createDimension = async (
  body: DimensionBody,
): Promise<ActionResult<Dimension>> => {
  const session = await getSession();
  if (!session) return result.fail("No autorizado");

  const parsed = DimensionSchema.safeParse(body);
  if (!parsed.success)
    return result.fail(
      "Datos inválidos",
      parsed.error.issues.map((issue) => issue.message),
    );

  const dimension = await prisma.dimension.create({ data: parsed.data });

  revalidatePath(LIST_PATH);
  return result.ok(dimension, "Dimensión creada correctamente");
};

export const updateDimension = async (
  id: number,
  body: DimensionBody,
): Promise<ActionResult<Dimension>> => {
  const session = await getSession();
  if (!session) return result.fail("No autorizado");

  const parsedId = DimensionIdSchema.safeParse(id);
  if (!parsedId.success) return result.fail("Identificador inválido");

  const parsed = DimensionSchema.safeParse(body);
  if (!parsed.success)
    return result.fail(
      "Datos inválidos",
      parsed.error.issues.map((issue) => issue.message),
    );

  const existing = await prisma.dimension.findFirst({
    where: { id: parsedId.data, deletedAt: null },
  });
  if (!existing) return result.fail("La dimensión no existe");

  const dimension = await prisma.dimension.update({
    where: { id: parsedId.data },
    data: parsed.data,
  });

  revalidatePath(LIST_PATH);
  revalidatePath(detailPath(parsedId.data));
  return result.ok(dimension, "Dimensión actualizada correctamente");
};

export const deleteDimension = async (
  id: number,
): Promise<ActionResult<undefined>> => {
  const session = await getSession();
  if (!session) return result.fail("No autorizado");

  const parsedId = DimensionIdSchema.safeParse(id);
  if (!parsedId.success) return result.fail("Identificador inválido");

  const existing = await prisma.dimension.findFirst({
    where: { id: parsedId.data, deletedAt: null },
  });
  if (!existing) return result.fail("La dimensión no existe");

  await prisma.dimension.update({
    where: { id: parsedId.data },
    data: { deletedAt: new Date() },
  });

  revalidatePath(LIST_PATH);
  return result.success("Dimensión eliminada correctamente");
};
