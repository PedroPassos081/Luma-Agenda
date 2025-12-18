"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createStudentSchema, type StudentPayload } from "../schema";
import bcrypt from "bcrypt";
import { Role } from "@prisma/client";

export async function createStudent(data: StudentPayload) {
    const validated = createStudentSchema.parse(data);

    // 1. Capturamos o email em uma variável local para o TypeScript entender
    const guardianEmail = validated.guardianEmail;

    // 2. Validação: Se NÃO tem email do pai, cria sem login
    if (!guardianEmail) {
        await createStudentWithoutLogin(validated);
        return;
    }

    // Se chegou aqui, guardianEmail é garantido como string! 🔒

    const hashedPassword = await bcrypt.hash("123456", 10);

    await prisma.$transaction(async (tx) => {

        //  Cria ou Atualiza o Usuário do PAI/MÃE
        await tx.user.upsert({
            where: { email: guardianEmail }, // Usa a variável local
            update: {
                role: Role.PARENT
            },
            create: {
                name: validated.guardianName,
                email: guardianEmail,        // Usa a variável local 
                password: hashedPassword,
                role: Role.PARENT,
            },
        });

        // Cria o Aluno vinculado a esse email
        await tx.student.create({
            data: {
                name: validated.name,
                birthDate: validated.birthDate,

                guardianName: validated.guardianName,
                guardianEmail: guardianEmail, // Usa a variável local
                guardianPhone: validated.guardianPhone || null,

                enrollments: {
                    create: {
                        classId: validated.classId,
                    },
                },
            },
        });
    });

    revalidatePath("/admin/alunos");
}

// Função auxiliar (mantém igual)
async function createStudentWithoutLogin(data: StudentPayload) {
    await prisma.student.create({
        data: {
            name: data.name,
            birthDate: data.birthDate,
            guardianName: data.guardianName,
            guardianPhone: data.guardianPhone,
            enrollments: { create: { classId: data.classId } },
        },
    });
    revalidatePath("/admin/alunos");
}