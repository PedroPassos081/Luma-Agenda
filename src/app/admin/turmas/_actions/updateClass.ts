"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Define o Schema completo (Dados da Turma + ID)
const updateClassSchema = z.object({
    id: z.string().cuid("ID inválido"),
    name: z.string().min(1, "O nome é obrigatório"),
    grade: z.string().min(1, "A série é obrigatória"),
    year: z.number().int().min(2020, "Ano inválido"),
    shift: z.enum(["MORNING", "AFTERNOON", "EVENING", "FULLTIME"]),
    segment: z.enum(["INFANTIL", "FUNDAMENTAL_I", "FUNDAMENTAL_II", "MEDIO"]),
});

// Inferimos o tipo a partir do Zod
type UpdateClassInput = z.infer<typeof updateClassSchema>;

export async function updateClass(data: UpdateClassInput) {
    // Validação: garante que o ID existe e que os dados estão corretos
    const validated = updateClassSchema.parse(data);

    // Separamos o ID do resto dos dados para usar no Prisma
    const { id, ...updateData } = validated;

    await prisma.class.update({
        where: { id },
        data: {
            name: updateData.name,
            grade: updateData.grade,
            year: updateData.year,
            shift: updateData.shift,
            segment: updateData.segment,
        },
    });

    revalidatePath("/admin/turmas");
}