"use server";

import type { Career } from "@/generated/prisma/client";
import { prisma } from "@/shared/lib/prisma";
import { result } from "@/shared/lib/result";
import { getSession } from "@/shared/lib/session";
import { ActionResult } from "@/shared/types/action-result";
import { revalidatePath } from "next/cache";
import {
  CareerBody,
  CareerIdSchema,
  CareerSchema,
} from "../schemas/career.schema";

const LIST_PATH = "/panel/carrer";

const detailPath = (id: number) => `${LIST_PATH}/${id}`;

const normalize = (body: CareerBody) => {
  return {
    name: body.name.trim(),
    description: body.description?.trim() || null,
  };
};

const nameExists = async (name: string, excludeId?: number) =>
  (await prisma.career.count({
    where: { name, ...(excludeId ? { id: { not: excludeId } } : {}) },
  })) > 0;

export const createCareer = async (
  body: CareerBody,
): Promise<ActionResult<Career>> => {
  const session = await getSession();
  if (!session) return result.fail("No autorizado");

  const parsedBody = CareerSchema.safeParse(body);
  if (!parsedBody.success)
    return result.fail("Datos de carrera inválidos", parsedBody.error.issues.map((issue) => issue.message));

  const data = normalize(parsedBody.data);

  if (await nameExists(data.name))
    return result.fail("Ya existe una carrera con ese nombre");

  const career = await prisma.career.create({
    data: { name: data.name, description: data.description },
  });

  revalidatePath(LIST_PATH);
  revalidatePath("/carreras");
  return result.ok(career, "Carrera creada correctamente");
};

export const updateCareer = async (
  id: number,
  body: CareerBody,
): Promise<ActionResult<Career>> => {
  const session = await getSession();
  if (!session) return result.fail("No autorizado");

  const parsedId = CareerIdSchema.safeParse(id);
  if (!parsedId.success) return result.fail("Identificador inválido");

  const existing = await prisma.career.findFirst({
    where: { id: parsedId.data, deletedAt: null },
  });
  if (!existing) return result.fail("La carrera no existe");

  const parsedBody = CareerSchema.safeParse(body);
  if (!parsedBody.success)
    return result.fail("Datos de carrera inválidos", parsedBody.error.issues.map((issue) => issue.message));

  const data = normalize(parsedBody.data);

  if (await nameExists(data.name, parsedId.data))
    return result.fail("Ya existe una carrera con ese nombre");

  const career = await prisma.career.update({
    where: { id: parsedId.data },
    data: { name: data.name, description: data.description },
  });

  revalidatePath(LIST_PATH);
  revalidatePath(detailPath(parsedId.data));
  revalidatePath("/carreras");
  revalidatePath(`/carreras/${parsedId.data}`);
  return result.ok(career, "Carrera actualizada correctamente");
};

export const deleteCareer = async (
  id: number,
): Promise<ActionResult<undefined>> => {
  const session = await getSession();
  if (!session) return result.fail("No autorizado");

  const parsedId = CareerIdSchema.safeParse(id);
  if (!parsedId.success) return result.fail("Identificador inválido");

  const existing = await prisma.career.findFirst({
    where: { id: parsedId.data, deletedAt: null },
  });
  if (!existing) return result.fail("La carrera no existe");

  await prisma.career.update({
    where: { id: parsedId.data },
    data: { deletedAt: new Date() },
  });

  revalidatePath(LIST_PATH);
  revalidatePath("/carreras");
  revalidatePath(`/carreras/${parsedId.data}`);
  return result.success("Carrera eliminada correctamente");
};
