"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createAnnouncementSchema } from "../schema";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

export async function createAnnouncement(formData: FormData) {
    // Extrair dados básicos do FormData
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    // Pegamos o arquivo fisico
    const imageFile = formData.get("imageFile") as File | null;

    let imageUrl: string | null = null;

    // 2. Lógica de Upload de Imagem (se houver arquivo)
    if (imageFile && imageFile.size > 0) {
        // Validação básica de tipo
        if (!imageFile.type.startsWith("image/")) {
            return { error: "O arquivo selecionado não é uma imagem válida." };
        }
        // Validação de tamanho (ex: 5MB)
        if (imageFile.size > 5 * 1024 * 1024) {
            return { error: "A imagem deve ter no máximo 5MB." };
        }

        try {
            //  Converter o arquivo para um Buffer do Node.js
            const bytes = await imageFile.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // b) Definir onde salvar (pasta public/uploads)
            // O 'process.cwd()' pega a raiz do projeto
            const uploadDir = path.join(process.cwd(), "public", "uploads");

            // Garante que a pasta existe (cria se não existir)
            await mkdir(uploadDir, { recursive: true });

            // c) Gerar um nome único para o arquivo (timestamp + hash aleatório)
            // Isso evita que uma imagem sobrescreva outra com o mesmo nome
            const fileExtension = path.extname(imageFile.name) || ".jpg";
            const fileName = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}${fileExtension}`;
            const filePath = path.join(uploadDir, fileName);

            // d) Escrever o arquivo no disco
            await writeFile(filePath, buffer);

            // e) Definir a URL pública que será salva no banco
            // Como salvamos em 'public/uploads', a URL é '/uploads/nome-do-arquivo'
            imageUrl = `/uploads/${fileName}`;

        } catch (error) {
            console.error("Erro ao fazer upload da imagem:", error);
            return { error: "Falha ao salvar a imagem. Tente novamente." };
        }
    }

    // 3. Validação final dos dados com Zod antes de salvar no banco
    // Preparamos o objeto final com a URL gerada (ou null)
    const payload = { title, content, imageUrl };
    const validation = createAnnouncementSchema.safeParse(payload);

    if (!validation.success) {
        // Retorna o primeiro erro encontrado pelo Zod
        return { error: validation.error.issues[0].message };
    }

    // 4. Salvar no Banco de Dados
    await prisma.announcement.create({
        data: validation.data, // Usa os dados limpos e validados pelo Zod
    });

    // 5. Atualizar as telas
    revalidatePath("/admin/informativos");
    revalidatePath("/responsavel"); // O dashboard dos pais também precisa atualizar

    // Retorno de sucesso (sem erro)
    return {};
}

// A função de deletar permanece a mesma
export async function deleteAnnouncement(id: string) {
    await prisma.announcement.delete({ where: { id } });
    revalidatePath("/admin/informativos");
}