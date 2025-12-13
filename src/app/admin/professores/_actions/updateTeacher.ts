"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { teacherSchema } from "../schema";

export async function updateTeacher(
    teacherId: string,
    formData: FormData
) {
    const data = {
        name: String(formData.get("name")),
        email: String(formData.get("email")),
        subjects: formData.getAll("subjects") as string[],
        classes: formData.getAll("classes") as string[],
    };

    const parsed = teacherSchema.parse(data);

    await prisma.user.update({
        where: { id: teacherId },
        data: {
            name: parsed.name,
            email: parsed.email,

            teacherSubjects: {
                set: parsed.subjects?.map((id) => ({ id })) ?? [],
            },

            teacherClasses: {
                set: parsed.classes?.map((id) => ({ id })) ?? [],
            },
        },
    });

    revalidatePath("/admin/professores");
}
