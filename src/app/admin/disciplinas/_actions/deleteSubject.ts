"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteSubject(id: string) {
    await prisma.subject.delete({
        where: { id },
    });

    revalidatePath("/admin/disciplinas");
}