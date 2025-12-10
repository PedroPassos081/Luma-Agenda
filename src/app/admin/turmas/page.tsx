import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
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
      teacher: true,
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
