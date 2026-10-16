"use server";

import { prisma } from "@/shared/lib/prisma";
import { result } from "@/shared/lib/result";
import { getSession } from "@/shared/lib/session";
import { idSchema } from "@/shared/lib/validation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const UpdateKnowledgeLinkSchema = z.object({
  relevance: z.number().min(0.25).max(2),
  status: z.enum(["PRELIMINARY", "REVIEWED"]),
});

export const updateKnowledgeLink = async (
  id: number,
  body: z.infer<typeof UpdateKnowledgeLinkSchema>,
) => {
  const session = await getSession();
  if (!session) return result.fail("No autorizado");

  const parsedId = idSchema.safeParse(id);
  const parsedBody = UpdateKnowledgeLinkSchema.safeParse(body);
  if (!parsedId.success || !parsedBody.success)
    return result.fail("Revisa la ponderación y el estado de revisión");

  const exists = await prisma.careerKnowledgeLink.findUnique({
    where: { id: parsedId.data },
    select: { id: true },
  });
  if (!exists) return result.fail("La relación ya no existe");

  await prisma.careerKnowledgeLink.update({
    where: { id: parsedId.data },
    data: parsedBody.data,
  });
  revalidatePath("/panel/knowledge");
  revalidatePath("/carreras");
  revalidatePath("/form");
  return result.success("Relación actualizada");
};
