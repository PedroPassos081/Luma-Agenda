// app/admin/turmas/schema.ts
import { z } from "zod";

const ShiftEnum = z.enum(["MORNING", "AFTERNOON", "EVENING", "FULLTIME"]);
const SegmentEnum = z.enum(["INFANTIL", "FUNDAMENTAL_I", "FUNDAMENTAL_II", "MEDIO"]);

export const createClassSchema = z.object({
    name: z.string().min(1, "O nome é obrigatório"),
    grade: z.string().min(1, "A série é obrigatória"),
    year: z.coerce.number().int().min(2020, "Ano inválido"),
    shift: ShiftEnum,
    segment: SegmentEnum,
});

export const updateClassSchema = z.object({
    id: z.string().cuid(),
    ...createClassSchema.shape,
});

export type ClassPayload = z.infer<typeof createClassSchema>;
export type UpdateClassPayload = z.infer<typeof updateClassSchema>;