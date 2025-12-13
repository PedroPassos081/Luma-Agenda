"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// 1. Schema alinhado exatamente com seu prisma.schema
const createClassSchema = z.object({
    name: z.string().min(1, "O nome é obrigatório"),
    grade: z.string().min(1, "A série é obrigatória"),
    year: z.number().int().min(2020, "Ano inválido"), // Ajuste para aceitar anos recentes
    // Enum Shift exato do banco
    shift: z.enum(["MORNING", "AFTERNOON", "EVENING", "FULLTIME"]),
    // Enum Segment exato do banco
    segment: z.enum(["INFANTIL", "FUNDAMENTAL_I", "FUNDAMENTAL_II", "MEDIO"]),
});

export type ClassPayload = z.infer<typeof createClassSchema>;

export async function createClass(data: ClassPayload) {
    // 2. Validação: Se algo estiver errado, o Zod lança um erro aqui 
    const validated = createClassSchema.parse(data);

    // 3. Criação no banco
    await prisma.class.create({
        data: {
            name: validated.name,
            grade: validated.grade,
            year: validated.year,
            shift: validated.shift,
            segment: validated.segment,
        },
    });

    revalidatePath("/admin/turmas");
}