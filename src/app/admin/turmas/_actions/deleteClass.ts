"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Schema para garantir que o ID é uma string válida (CUID)
const deleteClassSchema = z.object({
    id: z.string().cuid("ID da turma inválido"),
});

export async function deleteClass(id: string) {
    // Validação com Zod
    // Cria um objeto temporário { id } para validar contra o schema
    const validated = deleteClassSchema.parse({ id });

    // Limpeza de dados relacionados 
    // Usamos validated.id para garantir que estamos usando o dado limpo
    await prisma.enrollment.deleteMany({ where: { classId: validated.id } });
    await prisma.grade.deleteMany({ where: { classId: validated.id } });

    // Deleta a turma
    await prisma.class.delete({
        where: { id: validated.id },
    });

    // Atualiza a tela
    revalidatePath("/admin/turmas");
}