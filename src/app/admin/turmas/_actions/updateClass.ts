'use server'
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { updateClassSchema, type UpdateClassPayload } from "../schema"; // <--- Importe daqui!

export async function updateClass(data: UpdateClassPayload) {
    const validated = updateClassSchema.parse(data);
    const { id, ...updateData } = validated;

    await prisma.class.update({
        where: { id },
        data: updateData
    });

    revalidatePath("/admin/turmas");
}