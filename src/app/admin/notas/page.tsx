import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import GradesClient from "./GradesClient";

type StudentGradeData = {
  id: string;
  name: string;
  gradeValue: number | null;
};

export default async function NotasPage({
  searchParams,
}: {
  searchParams: Promise<{ classId?: string; subjectId?: string; term?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "ADMIN") redirect("/login");

  const params = await searchParams;

  const classes = await prisma.class.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  const subjects = await prisma.subject.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  let studentsData: StudentGradeData[] = [];

  if (params.classId && params.subjectId) {
    const term = Number(params.term ?? "1");

    const enrollments = await prisma.enrollment.findMany({
      where: { classId: params.classId },
      include: {
        student: {
          include: {
            grades: {
              where: {
                subjectId: params.subjectId,
                term: term,
                classId: params.classId,
              },
              take: 1,
            },
          },
        },
      },
      orderBy: { student: { name: "asc" } },
    });

    studentsData = enrollments.map((e) => ({
      id: e.student.id,
      name: e.student.name,
      gradeValue: e.student.grades[0]?.value ?? null,
    }));
  }

  return (
    <GradesClient
      classes={classes}
      subjects={subjects}
      students={studentsData}
      selectedClassId={params.classId}
      selectedSubjectId={params.subjectId}
      selectedTerm={params.term}
    />
  );
}