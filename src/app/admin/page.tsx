import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
  UserRound,
  GraduationCap,
  Building,
  BookOpen,
} from "lucide-react";

import { ReactNode } from "react";



export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/login");
  }

  const [totalStudents, totalTeachers, totalClasses, totalSubjects] =
    await Promise.all([
      prisma.student.count(),
      prisma.user.count({ where: { role: "TEACHER" } }),
      prisma.class.count().catch(() => 0),
      prisma.subject.count().catch(() => 0),
    ]);

  return (
    <div className="max-w-7xl mx-auto">

      {/* HERO */}
      <div className="rounded-3xl p-8 bg-gradient-to-r from-purple-600 to-purple-400 text-white shadow-lg mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-semibold">Bem-vindo ao Luma Agenda! 🎓</h2>
          <p className="mt-2 text-sm opacity-90">
            Gerencie sua escola de forma simples e intuitiva. Acompanhe tudo em tempo real.
          </p>
        </div>

       
      </div>

      {/* CARDS DE MÉTRICAS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard title="Total de Alunos" value={totalStudents} icon={<UserRound />} />
        <MetricCard title="Professores" value={totalTeachers} icon={<GraduationCap />} />
        <MetricCard title="Turmas" value={totalClasses} icon={<Building />} />
        <MetricCard title="Disciplinas" value={totalSubjects} icon={<BookOpen />} />
      </div>

      {/* PLACEHOLDERS DAS SEÇÕES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">
        <SectionCard title="Atividade Recente" />
        <SectionCard title="Últimas Notas" />
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: number;
  icon: ReactNode;
}

function MetricCard({ title, value, icon }: MetricCardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow border border-slate-200 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">{title}</p>
        <div className="bg-purple-100 p-2 rounded-lg text-purple-700">
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

interface SectionCardProps {
  title: string;
}

function SectionCard({ title }: SectionCardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow border border-slate-200">
      <h3 className="font-semibold text-slate-800 mb-3">{title}</h3>
      <p className="text-sm text-slate-500">Conteúdo será carregado futuramente.</p>
    </div>
  );
}

