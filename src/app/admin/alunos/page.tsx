import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import StudentsClient, { StudentListItem } from "./StudentsClient";

export default async function StudentsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/login");
  }

  const students = await prisma.student.findMany({
    include: {
      enrollments: {
        include: {
          class: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 1, // pega a turma mais recente
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  const studentsForClient: StudentListItem[] = students.map((student) => {
    const enrollment = student.enrollments[0];
    const currentClass = enrollment?.class;

    return {
      id: student.id,
      name: student.name,
      // por enquanto não temos esses campos no banco, então deixo nulo
      birthDate: null,
      guardianName: null,
      guardianEmail: null,
      guardianPhone: null,
      className: currentClass?.name ?? "Sem turma",
    };
  });

  return <StudentsClient students={studentsForClient} />;
}
