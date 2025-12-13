"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { createTeacherSchema, type TeacherPayload } from "../schema";

export async function createTeacher(data: TeacherPayload) {
    const validated = createTeacherSchema.parse(data);

    const passwordHash = await bcrypt.hash("123456", 10);

    await prisma.user.create({
        data: {
            name: validated.name,
            email: validated.email,
            password: passwordHash,
            role: "TEACHER",

            teacherSubjects: {
                connect: validated.subjects?.map((id) => ({ id })) ?? [],
            },
            teacherClasses: {
                connect: validated.classes?.map((id) => ({ id })) ?? [],
            },
        },
    });

    revalidatePath("/admin/professores");
}