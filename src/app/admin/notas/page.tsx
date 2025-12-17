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

type PageProps = {
  searchParams?: {
    classId?: string;
    subjectId?: string;
    term?: string;
  };
};

export default async function NotasPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "ADMIN") redirect("/login");

  const classes = await prisma.class.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  const subjects = await prisma.subject.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  const classId = searchParams?.classId;
  const subjectId = searchParams?.subjectId;
  const termParam = searchParams?.term;

  let studentsData: StudentGradeData[] = [];

  if (classId && subjectId) {
    const term = Number(termParam ?? "1");

    const enrollments = await prisma.enrollment.findMany({
      where: { classId },
      include: {
        student: {
          include: {
            grades: {
              where: {
                subjectId,
                term,
                classId,
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
      selectedClassId={classId}
      selectedSubjectId={subjectId}
      selectedTerm={termParam}
    />
  );
}
