"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { updateStudentSchema, type UpdateStudentPayload } from "../schema";

export async function updateStudent(data: UpdateStudentPayload) {
    const validated = updateStudentSchema.parse(data);
    const { id, ...updateData } = validated;

    await prisma.student.update({
        where: { id },
        data: {
            name: updateData.name,
            birthDate: updateData.birthDate,
            guardianName: updateData.guardianName,
            guardianEmail: updateData.guardianEmail || null,
            guardianPhone: updateData.guardianPhone || null,
        },
    });

    revalidatePath("/admin/alunos");
}