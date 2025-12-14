"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { updateSubjectSchema, type UpdateSubjectPayload } from "../schema";

export async function updateSubject(data: UpdateSubjectPayload) {
    const validated = updateSubjectSchema.parse(data);

    await prisma.subject.update({
        where: { id: validated.id },
        data: {
            name: validated.name,
            code: validated.code?.toUpperCase(),
        },
    });

    revalidatePath("/admin/disciplinas");
}