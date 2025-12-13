import { z } from "zod";

export const createStudentSchema = z.object({
    name: z.string().min(3, "O nome deve ter pelo menos 3 letras"),

    // z.coerce.date() é mágico: transforma a string "2010-05-15" do input em Date
    birthDate: z.coerce.date()
        .refine((date) => !isNaN(date.getTime()), {
            message: "A data de nascimento é obrigatória e deve ser válida"
        }),

    guardianName: z.string().min(3, "Nome do responsável é obrigatório"),

    // Opcionais: aceita string vazia ou undefined e transforma em null
    guardianEmail: z.string().email("E-mail inválido").optional().or(z.literal("")),
    guardianPhone: z.string().min(10, "Telefone inválido").optional().or(z.literal("")),
});

export const updateStudentSchema = z.object({
    id: z.string().cuid("ID inválido"),
}).merge(createStudentSchema);

export type StudentPayload = z.infer<typeof createStudentSchema>;
export type UpdateStudentPayload = z.infer<typeof updateStudentSchema>;