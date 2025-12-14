import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// 👇 IMPORTANTE: Importar o SubjectsClient (Cards), não o StudentsClient
import SubjectsClient from "./SubjectsClient";

export default async function DisciplinasPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/login");
  }

  // Busca as disciplinas e conta quantos professores dão aula nela
  const subjects = await prisma.subject.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { teachers: true },
      },
    },
  });

  // 👇 Retorna o componente de Cards
  return <SubjectsClient subjects={subjects} />;
}