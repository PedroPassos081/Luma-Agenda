"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Shift, Segment } from "@prisma/client";

export async function createClass(formData: FormData) {
    const name = formData.get("name") as string;
    const grade = formData.get("grade") as string;
    const year = Number(formData.get("year"));

    const shift = formData.get("shift") as Shift;
    const segment = formData.get("segment") as Segment;

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
