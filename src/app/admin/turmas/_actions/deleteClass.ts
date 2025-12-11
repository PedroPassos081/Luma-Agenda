"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteClass(id: string) {
    if (!id) {
        throw new Error("ID da turma é obrigatório.");
    }

    // mais seguro com FK:
    await prisma.enrollment.deleteMany({ where: { classId: id } });
    await prisma.grade.deleteMany({ where: { classId: id } });

    await prisma.class.delete({
        where: { id },
    });

    // Atualiza a tela de turmas
    revalidatePath("/admin/turmas");
}
