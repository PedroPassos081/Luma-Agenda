"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createStudentSchema, type StudentPayload } from "../schema";

export async function createStudent(data: StudentPayload) {
    const validated = createStudentSchema.parse(data);

    await prisma.student.create({
        data: {
            name: validated.name,
            birthDate: validated.birthDate,
            guardianName: validated.guardianName,
            // Se vier string vazia "", salvamos null no banco para ficar limpo
            guardianEmail: validated.guardianEmail || null,
            guardianPhone: validated.guardianPhone || null,
        },
    });

    revalidatePath("/admin/alunos");
}