"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { updateTeacherSchema, type UpdateTeacherPayload } from "../schema";

export async function updateTeacher(data: UpdateTeacherPayload) {
    const validated = updateTeacherSchema.parse(data);
    const { id, ...rest } = validated;

    await prisma.user.update({
        where: { id },
        data: {
            name: rest.name,
            email: rest.email,

            // Atualiza as disciplinas
            teacherSubjects: {
                set: rest.subjects?.map((subjectId) => ({ id: subjectId })) ?? [],
            },

            // Atualiza as turmas
            teacherClasses: {
                set: rest.classes?.map((classId) => ({ id: classId })) ?? [],
            },
        },
    });

    revalidatePath("/admin/professores");
}