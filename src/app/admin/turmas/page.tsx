import { getServerSession } from "next-auth";
// Ajustei o import para o caminho absoluto que costuma ser mais seguro,
// mas se o seu ../../ estava funcionando, pode manter.
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

  const classes = await prisma.class.findMany({
    include: {
      // 👇 AQUI ESTAVA O ERRO!
      // Mudamos de 'teacher' (singular) para 'teachers' (plural)
      teachers: {
        select: { name: true }, // Trazemos só o nome para o front ficar leve
      },
      _count: {
        select: { students: true },
      },
    },
    orderBy: [{ grade: "asc" }, { name: "asc" }],
  });

  return (
    <TurmasClient
      classes={classes}
      shiftLabel={SHIFT_LABEL}
    />
  );
}