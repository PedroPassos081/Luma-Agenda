"use server";

import { prisma } from "@/lib/prisma";
import { createTeacherSchema, TeacherPayload } from "../schema";
import bcrypt from "bcrypt";
import { revalidatePath } from "next/cache";

export async function createTeacher(data: TeacherPayload) {
    //  Valida os dados no backend também
    const result = createTeacherSchema.safeParse(data);

    if (!result.success) {
        throw new Error("Dados inválidos");
    }

    const { name, email, password, subjects, classes } = result.data;

    // Define a senha: Se veio no formulário usa ela, senão usa "mudar123"
    const plainTextPassword = password || "mudar123";

    // Criptografa a senha
    const hashedPassword = await bcrypt.hash(plainTextPassword, 10);

    // Cria no Banco com Prisma
    await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            role: "TEACHER",
            // Conecta as disciplinas (NxN)
            teacherSubjects: {
                connect: subjects.map((id) => ({ id })),
            },
            // Conecta as turmas (NxN)
            teacherClasses: {
                connect: classes.map((id) => ({ id })),
            },
        },
    });

    revalidatePath("/teachers"); // Atualiza a lista na tela
}