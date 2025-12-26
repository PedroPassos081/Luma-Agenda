"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { settingsSchema } from "../schema";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";



export async function updateSettings(formData: FormData) {
    // 1. Trata a imagem (Logo)
    const logoFile = formData.get("logoFile") as File | null;
    let logoUrl = formData.get("schoolLogo") as string | null; // Mantém a antiga se não mudar

    if (logoFile && logoFile.size > 0) {
        const uploadDir = path.join(process.cwd(), "public", "uploads");
        await mkdir(uploadDir, { recursive: true });

        const fileName = `logo-${Date.now()}-${crypto.randomBytes(4).toString("hex")}${path.extname(logoFile.name)}`;
        const filePath = path.join(uploadDir, fileName);

        await writeFile(filePath, Buffer.from(await logoFile.arrayBuffer()));
        logoUrl = `/uploads/${fileName}`;
    }

    //  Prepara os dados para validação
    // Checkbox HTML não envia nada se desmarcado, então verificamos se existe
    const rawData = {
        schoolName: formData.get("schoolName"),
        schoolLogo: logoUrl,
        cnpj: formData.get("cnpj"),
        address: formData.get("address"),
        phone: formData.get("phone"),
        currentYear: formData.get("currentYear"),
        passingGrade: formData.get("passingGrade"),
        periodicity: formData.get("periodicity"),
        minFrequency: formData.get("minFrequency"),
        isGradesVisible: formData.get("isGradesVisible") === "on",
        isMaintenance: formData.get("isMaintenance") === "on",
    };

    const validated = settingsSchema.parse(rawData);

    // Atualiza (Upsert na primeira configuração encontrada)
    // Pegamos a primeira config que existir. Se não tiver, criamos.
    const existingConfig = await prisma.schoolSettings.findFirst();

    if (existingConfig) {
        await prisma.schoolSettings.update({
            where: { id: existingConfig.id },
            data: validated,
        });
    } else {
        await prisma.schoolSettings.create({
            data: validated,
        });
    }

    revalidatePath("/admin/configuracoes");
    revalidatePath("/"); // Atualiza o site todo (pois muda nome da escola e regras)
    return { success: true };
}