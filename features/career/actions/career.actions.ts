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

type CareerDimensionInput = { dimensionId: number; weight: number };

const normalize = (body: CareerBody) => {
  const dimensions = new Map<number, number>();

  for (const dimension of body.dimensions)
    if (dimension.weight > 0)
      dimensions.set(dimension.dimensionId, dimension.weight);

  return {
    name: body.name.trim(),
    description: body.description?.trim() || null,
    dimensions: [...dimensions].map(([dimensionId, weight]) => ({
      dimensionId,
      weight,
    })),
  };
};

const nameExists = async (name: string, excludeId?: number) =>
  (await prisma.career.count({
    where: { name, ...(excludeId ? { id: { not: excludeId } } : {}) },
  })) > 0;

const dimensionsExist = async (dimensions: CareerDimensionInput[]) => {
  if (dimensions.length === 0) return true;

  const ids = dimensions.map((dimension) => dimension.dimensionId);
  const total = await prisma.dimension.count({
    where: { id: { in: ids }, deletedAt: null },
  });

  return total === ids.length;
};

export const createCareer = async (
  body: CareerBody,
): Promise<ActionResult<Career>> => {
  const session = await getSession();
  if (!session) return result.fail("No autorizado");

  const parsed = CareerSchema.safeParse(body);
  if (!parsed.success)
    return result.fail(
      "Datos inválidos",
      parsed.error.issues.map((issue) => issue.message),
    );

  const data = normalize(parsed.data);

  if (await nameExists(data.name))
    return result.fail("Ya existe una carrera con ese nombre");

  if (!(await dimensionsExist(data.dimensions)))
    return result.fail("Alguna de las dimensiones seleccionadas no existe");

  const career = await prisma.$transaction(async (tx) => {
    const created = await tx.career.create({
      data: { name: data.name, description: data.description },
    });

    await tx.careerDimension.createMany({
      data: data.dimensions.map((dimension) => ({
        careerId: created.id,
        dimensionId: dimension.dimensionId,
        weight: dimension.weight,
      })),
    });

    return created;
  });

  revalidatePath(LIST_PATH);
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

  const parsed = CareerSchema.safeParse(body);
  if (!parsed.success)
    return result.fail(
      "Datos inválidos",
      parsed.error.issues.map((issue) => issue.message),
    );

  const existing = await prisma.career.findFirst({
    where: { id: parsedId.data, deletedAt: null },
  });
  if (!existing) return result.fail("La carrera no existe");

  const data = normalize(parsed.data);

  if (await nameExists(data.name, parsedId.data))
    return result.fail("Ya existe una carrera con ese nombre");

  if (!(await dimensionsExist(data.dimensions)))
    return result.fail("Alguna de las dimensiones seleccionadas no existe");

  const career = await prisma.$transaction(async (tx) => {
    const updated = await tx.career.update({
      where: { id: parsedId.data },
      data: { name: data.name, description: data.description },
    });

    await tx.careerDimension.deleteMany({
      where: { careerId: parsedId.data },
    });

    await tx.careerDimension.createMany({
      data: data.dimensions.map((dimension) => ({
        careerId: parsedId.data,
        dimensionId: dimension.dimensionId,
        weight: dimension.weight,
      })),
    });

    return updated;
  });

  revalidatePath(LIST_PATH);
  revalidatePath(detailPath(parsedId.data));
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
  return result.success("Carrera eliminada correctamente");
};
