import { z } from "zod";

export const createTeacherSchema = z.object({
    name: z.string().min(3, "O nome deve ter pelo menos 3 letras"),
    email: z.string().email("Formato de e-mail inválido"),

    // Vamos esperar arrays de IDs (strings) para conectar no banco
    subjects: z.array(z.string()).optional().default([]),
    classes: z.array(z.string()).optional().default([]),
});

export const updateTeacherSchema = z.object({
    id: z.string().cuid("ID inválido"),
}).merge(createTeacherSchema);

export type TeacherPayload = z.infer<typeof createTeacherSchema>;
export type UpdateTeacherPayload = z.infer<typeof updateTeacherSchema>;