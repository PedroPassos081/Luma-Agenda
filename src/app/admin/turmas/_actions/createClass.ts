'use server'
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createClassSchema, type ClassPayload } from "../schema"; // <--- Importe daqui!

export async function createClass(data: ClassPayload) {
    const validated = createClassSchema.parse(data);
    // ... resto do código igual (prisma.create...)
    await prisma.class.create({
        data: {
            name: validated.name,
            grade: validated.grade,
            year: validated.year,
            shift: validated.shift,
            segment: validated.segment,
        }
    })
    revalidatePath("/admin/turmas");
}