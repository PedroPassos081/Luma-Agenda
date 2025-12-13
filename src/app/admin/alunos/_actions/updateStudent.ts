"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { updateStudentSchema, type UpdateStudentPayload } from "../schema";

export async function updateStudent(data: UpdateStudentPayload) {
    const validated = updateStudentSchema.parse(data);
    const { id, classId, ...rest } = validated;

    // Usamos transaction para garantir que tudo aconteça ou nada aconteça
    await prisma.$transaction(async (tx) => {
        // 1. Atualiza dados do aluno
        await tx.student.update({
            where: { id },
            data: {
                name: rest.name,
                birthDate: rest.birthDate,
                guardianName: rest.guardianName,
                guardianEmail: rest.guardianEmail || null,
                guardianPhone: rest.guardianPhone || null,
            },
        });

        // 2. Atualiza a turma (Remove matrículas antigas e cria a nova)
        // Isso garante que o aluno esteja apenas na turma selecionada
        await tx.enrollment.deleteMany({ where: { studentId: id } });
        await tx.enrollment.create({
            data: {
                studentId: id,
                classId: classId,
            },
        });
    });

    revalidatePath("/admin/alunos");
}