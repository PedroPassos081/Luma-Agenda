"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { updateStudentSchema, type UpdateStudentPayload } from "../schema";
import bcrypt from "bcrypt";
import { Role } from "@prisma/client";

export async function updateStudent(data: UpdateStudentPayload) {
    const validated = updateStudentSchema.parse(data);

    // Separamos ID, Turma, Senha e o resto dos dados
    const { id, classId, password, ...rest } = validated;

    // Lógica da Senha: Só prepara o hash se o admin digitou algo novo
    let hashedPassword = undefined;
    if (password && password.trim() !== "") {
        hashedPassword = await bcrypt.hash(password, 10);
    }

    // Travamos o email em uma variável para o TypeScript
    const guardianEmail = rest.guardianEmail;

    // Transação para garantir consistência
    await prisma.$transaction(async (tx) => {

        // A) Atualiza dados do ALUNO (Student)
        await tx.student.update({
            where: { id },
            data: {
                name: rest.name,
                birthDate: rest.birthDate,
                guardianName: rest.guardianName,
                guardianEmail: guardianEmail || null,
                guardianPhone: rest.guardianPhone || null,
            },
        });

        // Atualiza a TURMA (Remove antigas, cria nova)
        // Isso move o aluno de turma se o classId mudou
        await tx.enrollment.deleteMany({ where: { studentId: id } });
        await tx.enrollment.create({
            data: {
                studentId: id,
                classId: classId,
            },
        });

        //  Atualiza ou Cria o USUÁRIO DO PAI (User)
        // Só faz sentido mexer no login se tiver um email de responsável válido
        if (guardianEmail) {
            // Preparamos a senha padrão caso estejamos CRIANDO um usuário novo agora
            // (ex: aluno não tinha email de pai antes e agora tem)
            const defaultPassword = await bcrypt.hash("123456", 10);

            await tx.user.upsert({
                where: { email: guardianEmail },
                // UPDATE: Se o usuário já existe...
                update: {
                    name: rest.guardianName, // Atualiza o nome
                    role: Role.PARENT,       // Garante a permissão
                    // Mágica do JS: Só adiciona o campo password se hashedPassword existir
                    ...(hashedPassword ? { password: hashedPassword } : {}),
                },
                // CREATE: Se o usuário não existe...
                create: {
                    name: rest.guardianName,
                    email: guardianEmail,
                    role: Role.PARENT,
                    // Usa a senha digitada OU a padrão 123456
                    password: hashedPassword || defaultPassword,
                },
            });
        }
    });

    revalidatePath("/admin/alunos");
}