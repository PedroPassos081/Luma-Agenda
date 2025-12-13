import { z } from "zod";

export const teacherSchema = z.object({
    name: z.string().min(3),
    email: z.string().email(),
    subjects: z.array(z.string()).optional(),
    classes: z.array(z.string()).optional(),
});

export type TeacherInput = z.infer<typeof teacherSchema>;
