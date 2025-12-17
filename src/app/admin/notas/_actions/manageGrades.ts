"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const gradeSchema = z.object({
    studentId: z.string().cuid(),
    classId: z.string().cuid(),
    subjectId: z.string().cuid(),
    term: z.coerce.number().min(1).max(4),
    value: z.coerce.number().min(0).max(10),
});

export async function upsertGrade(formData: FormData) {
    const payload = {
        studentId: formData.get("studentId"),
        classId: formData.get("classId"),
        subjectId: formData.get("subjectId"),
        term: formData.get("term"),
        value: formData.get("value"),
    };

    const validated = gradeSchema.parse(payload);

    const existingGrade = await prisma.grade.findFirst({
        where: {
            studentId: validated.studentId,
            subjectId: validated.subjectId,
            classId: validated.classId,
            term: validated.term,
        },
    });

    if (existingGrade) {
        await prisma.grade.update({
            where: { id: existingGrade.id },
            data: { value: validated.value },
        });
    } else {
        await prisma.grade.create({
            data: {
                studentId: validated.studentId,
                subjectId: validated.subjectId,
                classId: validated.classId,
                term: validated.term,
                value: validated.value,
            },
        });
    }

    revalidatePath("/admin/notas");
    return { success: true };
}