"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const gradeSchema = z.object({
    studentId: z.string().cuid(),
    classId: z.string().cuid(),
    subjectId: z.string().cuid(),
    term: z.coerce.number().min(1).max(4),
    testGrade: z.coerce.number().min(0).max(10).optional().default(0),
    workGrade: z.coerce.number().min(0).max(10).optional().default(0),
    behaviorGrade: z.coerce.number().min(0).max(10).optional().default(0),
});

export async function upsertGrade(formData: FormData) {
    const rawData = {
        studentId: formData.get("studentId"),
        classId: formData.get("classId"),
        subjectId: formData.get("subjectId"),
        term: formData.get("term"),
        testGrade: formData.get("testGrade") || "0",
        workGrade: formData.get("workGrade") || "0",
        behaviorGrade: formData.get("behaviorGrade") || "0",
    };

    const validated = gradeSchema.parse(rawData);

    const finalAverage =
        (validated.testGrade + validated.workGrade + validated.behaviorGrade) / 3;

    const dataToSave = {
        studentId: validated.studentId,
        subjectId: validated.subjectId,
        classId: validated.classId,
        term: validated.term,
        testGrade: validated.testGrade,
        workGrade: validated.workGrade,
        behaviorGrade: validated.behaviorGrade,
        value: parseFloat(finalAverage.toFixed(1)), // Salva com 1 casa decimal
    };

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
            data: {
                testGrade: dataToSave.testGrade,
                workGrade: dataToSave.workGrade,
                behaviorGrade: dataToSave.behaviorGrade,
                value: dataToSave.value,
            },
        });
    } else {
        await prisma.grade.create({
            data: dataToSave,
        });
    }

    revalidatePath("/admin/notas");
    revalidatePath("/admin/relatorios"); // Atualiza o boletim também
    return { success: true };
}