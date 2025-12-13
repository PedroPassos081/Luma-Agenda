"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { teacherSchema } from "../schema";
import bcrypt from "bcryptjs";

export async function createTeacher(formData: FormData) {
    const data = {
        name: String(formData.get("name")),
        email: String(formData.get("email")),
        subjects: formData.getAll("subjects") as string[],
        classes: formData.getAll("classes") as string[],
    };

    const parsed = teacherSchema.parse(data);

    const passwordHash = await bcrypt.hash("123456", 10);

    await prisma.user.create({
        data: {
            name: parsed.name,
            email: parsed.email,
            password: passwordHash,
            role: "TEACHER",

            teacherSubjects: {
                connect: parsed.subjects?.map((id) => ({ id })) ?? [],
            },

            teacherClasses: {
                connect: parsed.classes?.map((id) => ({ id })) ?? [],
            },
        },
    });

    revalidatePath("/admin/professores");
}
