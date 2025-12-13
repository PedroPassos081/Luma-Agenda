"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const deleteSchema = z.object({
    id: z.string().cuid(),
});

export async function deleteTeacher(teacherId: string) {
    const validated = deleteSchema.parse({ id: teacherId });

    await prisma.user.delete({
        where: { id: validated.id },
    });

    revalidatePath("/admin/professores");
}