"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { addSubjectSchema, AddSubjectPayload } from "../schema";

// Adicionar uma disciplina na turma
export async function addSubjectToClass(data: AddSubjectPayload) {
    const validated = addSubjectSchema.parse(data);

    // Verifica se essa matéria já existe nessa turma para não duplicar
    const exists = await prisma.classSubject.findFirst({
        where: {
            classId: validated.classId,
            subjectId: validated.subjectId,
        },
    });

    if (exists) {
        return { error: "Esta disciplina já foi adicionada a esta turma." };
    }

    await prisma.classSubject.create({
        data: {
            classId: validated.classId,
            subjectId: validated.subjectId,
            teacherId: validated.teacherId || null,
        },
    });

    revalidatePath("/admin/turmas");
    return { success: true };
}

// Remover uma disciplina da turma
export async function removeSubjectFromClass(id: string) {
    try {
        await prisma.classSubject.delete({ where: { id } });
        revalidatePath("/admin/turmas");
        return { success: true };
    } catch {
        return { error: "Erro ao remover disciplina." };
    }
}