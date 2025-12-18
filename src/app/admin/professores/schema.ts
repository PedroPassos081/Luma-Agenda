import { z } from "zod";

export const createTeacherSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    email: z.string().email("Email inválido"),
    password: z.string().optional(),
    subjects: z.array(z.string()),
    classes: z.array(z.string()),
});

export type TeacherPayload = z.infer<typeof createTeacherSchema>;

export const updateTeacherSchema = createTeacherSchema.extend({
    id: z.string(),
});

export type UpdateTeacherPayload = z.infer<typeof updateTeacherSchema>;