import { z } from "zod";

export const subjectSchema = z.object({
    name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
    code: z.string().max(5, "Máximo 5 letras").optional().or(z.literal("")),
});

export const updateSubjectSchema = z.object({
    id: z.string().cuid(),
}).merge(subjectSchema);

export type SubjectPayload = z.infer<typeof subjectSchema>;
export type UpdateSubjectPayload = z.infer<typeof updateSubjectSchema>;