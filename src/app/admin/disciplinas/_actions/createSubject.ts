"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { subjectSchema, type SubjectPayload } from "../schema";

export async function createSubject(data: SubjectPayload) {
  const validated = subjectSchema.parse(data);

  await prisma.subject.create({
    data: {
      name: validated.name,
      // O "?" verifica se code existe. Se existir, transforma em maiúsculo.
      code: validated.code?.toUpperCase(),
    },
  });

  revalidatePath("/admin/disciplinas");
}