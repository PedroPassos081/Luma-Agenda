import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import ReportClient from "./ReportClient";

type GradeMap = {
  subjectName: string;
  term1?: number | null;
  term2?: number | null;
  term3?: number | null;
  term4?: number | null;
  average?: number;
};

type GroupedSubject = {
  subjectName: string;
  term1: number | null;
  term2: number | null;
  term3: number | null;
  term4: number | null;
  total: number;
  count: number;
};

export default async function RelatoriosPage({
  searchParams,
}: {
  
  searchParams: Promise<{ classId?: string; studentId?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "ADMIN") redirect("/login");

  
  const params = await searchParams;

  // Busca turmas
  const classes = await prisma.class.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  // Busca alunos usando 'params' 
  let students: { id: string; name: string }[] = [];
  if (params.classId) {
    const enrollments = await prisma.enrollment.findMany({
      where: { classId: params.classId },
      include: { student: true },
      orderBy: { student: { name: "asc" } },
    });
    students = enrollments.map((e) => e.student);
  }

  // Monta boletim
  let reportData: GradeMap[] = [];

  if (params.studentId && params.classId) {
    const grades = await prisma.grade.findMany({
      where: {
        studentId: params.studentId,
        classId: params.classId,
      },
      include: { subject: true },
    });

    const groupedData: Record<string, GroupedSubject> = {};

    grades.forEach((grade) => {
      const subjectName = grade.subject.name;

      if (!groupedData[subjectName]) {
        groupedData[subjectName] = {
          subjectName,
          term1: null,
          term2: null,
          term3: null,
          term4: null,
          total: 0,
          count: 0,
        };
      }

      if (grade.term === 1) groupedData[subjectName].term1 = grade.value;
      if (grade.term === 2) groupedData[subjectName].term2 = grade.value;
      if (grade.term === 3) groupedData[subjectName].term3 = grade.value;
      if (grade.term === 4) groupedData[subjectName].term4 = grade.value;
      
      groupedData[subjectName].total += grade.value;
      groupedData[subjectName].count += 1;
    });

    reportData = Object.values(groupedData).map((item) => ({
      subjectName: item.subjectName,
      term1: item.term1,
      term2: item.term2,
      term3: item.term3,
      term4: item.term4,
      average: item.count > 0 ? item.total / item.count : 0,
    }));
    
    reportData.sort((a, b) => a.subjectName.localeCompare(b.subjectName));
  }

  return (
    <ReportClient
      classes={classes}
      students={students}
      selectedClassId={params.classId}
      selectedStudentId={params.studentId}
      reportData={reportData}
    />
  );
}