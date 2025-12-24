import { z } from "zod";

export const createAnnouncementSchema = z.object({
    title: z.string().min(3, "O título deve ter pelo menos 3 caracteres."),
    content: z.string().min(5, "A mensagem é muito curta."),
    imageUrl: z.string().optional().nullable(),
});

export type AnnouncementPayload = z.infer<typeof createAnnouncementSchema>;