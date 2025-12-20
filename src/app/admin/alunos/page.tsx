import { prisma } from "@/lib/prisma";
import StudentsClient, { type StudentListItem } from "./StudentsClient";

export default async function AlunosPage() {
  // 1. Busca alunos (com a turma)
  const studentsRaw = await prisma.student.findMany({
    orderBy: { name: "asc" },
    include: {
      enrollments: {
        include: { class: true },
        take: 1, // Pega a turma atual
      },
    },
  });

  //  Busca TODAS as turmas disponíveis para o select
  const classesAvailable = await prisma.class.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, grade: true, shift: true }, 
  });

  // Formata os dados
  const formattedStudents: StudentListItem[] = studentsRaw.map((student) => {
    const currentClass = student.enrollments[0]?.class;
    
    return {
      id: student.id,
      name: student.name,
      birthDate: student.birthDate,
      className: currentClass?.name ?? "Sem turma",
      classId: currentClass?.id ?? "", 
      guardianName: student.guardianName,
      guardianEmail: student.guardianEmail,
      guardianPhone: student.guardianPhone,
    };
  });

  return (
    <StudentsClient 
      students={formattedStudents} 
      classes={classesAvailable} 
    />
  );
}