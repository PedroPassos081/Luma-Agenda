"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteTeacher(teacherId: string) {
    await prisma.user.delete({
        where: { id: teacherId },
    });

    revalidatePath("/admin/professores");
}
