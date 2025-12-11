"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { ClassPayload } from "./createClass";

export async function updateClass(input: { id: string } & ClassPayload) {
    const { id, ...data } = input;

    await prisma.class.update({
        where: { id },
        data: {
            name: data.name,
            grade: data.grade,
            year: data.year,
            shift: data.shift,
            segment: data.segment,
        },
    });

    revalidatePath("/admin/turmas");
}
