import { z } from "zod";
import { Shift, Segment } from "@prisma/client";

// 1. Schema para CRIAR Turma
export const createClassSchema = z.object({
    name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
    grade: z.string().min(1, "A série é obrigatória"),
    year: z.coerce.number().min(2000, "Ano inválido"),
    // Removemos configs extras para evitar conflito de tipos no Zod
    shift: z.nativeEnum(Shift),
    segment: z.nativeEnum(Segment),
});

export type ClassPayload = z.infer<typeof createClassSchema>;

// 2. Schema para ATUALIZAR Turma (Reutiliza o Create + ID obrigatório)
// 👇 É este que estava faltando!
export const updateClassSchema = createClassSchema.extend({
    id: z.string().cuid(),
});

export type UpdateClassPayload = z.infer<typeof updateClassSchema>;

// 3. Schema para ADICIONAR MATÉRIA NA GRADE
export const addSubjectSchema = z.object({
    classId: z.string().cuid(),
    subjectId: z.string().cuid("Selecione uma disciplina"),
    teacherId: z.string().cuid("Selecione um professor").optional().nullable(),
});

export type AddSubjectPayload = z.infer<typeof addSubjectSchema>;