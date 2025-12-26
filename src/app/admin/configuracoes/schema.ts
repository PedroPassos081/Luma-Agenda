import { z } from "zod";

export const settingsSchema = z.object({
    // Perfil
    schoolName: z.string().min(3, "Nome da escola é obrigatório"),
    schoolLogo: z.string().optional().nullable(),
    cnpj: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),

    // Acadêmico
    currentYear: z.string().min(4, "Ano inválido"),
    // O z.coerce força transformar a string do input em número
    passingGrade: z.coerce.number().min(0).max(10),
    periodicity: z.enum(["BIMESTRAL", "TRIMESTRAL", "SEMESTRAL"]),
    minFrequency: z.coerce.number().min(0).max(100),

    // Sistema
    isGradesVisible: z.boolean().optional(),
    isMaintenance: z.boolean().optional(),
});

export type SettingsPayload = z.infer<typeof settingsSchema>;