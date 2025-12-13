import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

import { authOptions } from "@/app/api/auth/[...nextauth]/route"; 
import TeachersClient from "./TeachersClient";

export default async function ProfessoresPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/login");
  }

  const [teachers, subjects, classes] = await Promise.all([
    prisma.user.findMany({
      where: { role: "TEACHER" },
      include: {
        teacherSubjects: true, // Necessário para o multi-select preenchido
        teacherClasses: true,  
      },
      orderBy: { name: "asc" },
    }),

    prisma.subject.findMany({
      orderBy: { name: "asc" },
    }),

    prisma.class.findMany({
      orderBy: [{ grade: "asc" }, { name: "asc" }],
    }),
  ]);

  return (
    <TeachersClient 
      teachers={teachers} 
      subjects={subjects} 
      classes={classes} 
    />
  );
}