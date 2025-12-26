import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Shift } from "@prisma/client";
import TurmasClient from "./TurmasClient";

const SHIFT_LABEL: Record<Shift, string> = {
  MORNING: "Manhã",
  AFTERNOON: "Tarde",
  EVENING: "Noite",
  FULLTIME: "Integral",
};

export default async function TurmasPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/login");
  }

  // 1. Busca as turmas com a grade completa (subjects + subject + teacher)
  const classes = await prisma.class.findMany({
    include: {
      _count: { select: { students: true } },
      subjects: {
        include: {
          subject: true, // Nome da matéria
          teacher: true, // Nome do professor
        },
      },
    },
    orderBy: [{ grade: "asc" }, { name: "asc" }],
  });

  // 2. Busca lista de Professores para o dropdown
 // Dentro de src/app/admin/professores/page.tsx

  const teachers = await prisma.user.findMany({
    where: { role: "TEACHER" },
    // Remova o 'include' antigo ou substitua pelo novo se precisar exibir
    // Por enquanto, vamos remover para destravar a tela:
    orderBy: { name: "asc" },
  });

  // 3. Busca lista de Disciplinas para o dropdown
  const subjects = await prisma.subject.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <TurmasClient
      classes={classes}
      teachers={teachers}
      subjects={subjects}
      shiftLabel={SHIFT_LABEL}
    />
  );
}