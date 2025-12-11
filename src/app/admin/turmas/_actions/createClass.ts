"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { Shift, Segment } from "@prisma/client";

export type ClassPayload = {
    name: string;
    grade: string;
    year: number;
    shift: Shift;
    segment: Segment;
};

export async function createClass(data: ClassPayload) {
    const { name, grade, year, shift, segment } = data;

    if (!name || !grade || !year || !shift || !segment) {
        throw new Error("Dados incompletos.");
    }

    await prisma.class.create({
        data: {
            name,
            grade,
            year,
            shift,
            segment,
        },
    });

    revalidatePath("/admin/turmas");
}
