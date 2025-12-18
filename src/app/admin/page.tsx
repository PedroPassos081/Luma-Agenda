import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
  UserRound,
  GraduationCap,
  Building,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import { ReactNode } from "react";
import Link from "next/link";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/login");
  }

  // Buscando tudo em paralelo 
  const [totalStudents, totalTeachers, totalClasses, totalSubjects, recentGrades] =
    await Promise.all([
      prisma.student.count(),
      prisma.user.count({ where: { role: "TEACHER" } }),
      prisma.class.count().catch(() => 0),
      prisma.subject.count().catch(() => 0),
      // Busca as 5 notas mais recentes
      prisma.grade.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          student: { select: { name: true } },
          subject: { select: { name: true } },
          class: { select: { name: true } },
        },
      }),
    ]);

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8">
      {/* HERO */}
      <div className="rounded-3xl p-8 bg-gradient-to-r from-purple-600 to-purple-400 text-white shadow-lg flex justify-between items-center">
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

      {/* SEÇÕES DE DETALHES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Atividade Recente (Placeholder mantido, ou podemos remover) */}
        <div className="bg-white rounded-2xl p-6 shadow border border-slate-200">
          <h3 className="font-semibold text-slate-800 mb-4">Atalhos Rápidos</h3>
          <div className="flex flex-col gap-3">
             <Link href="/admin/alunos" className="p-3 rounded-lg bg-slate-50 hover:bg-purple-50 flex items-center justify-between text-sm text-slate-600 hover:text-purple-700 transition-colors">
                <span>Matricular novo aluno</span>
                <ArrowRight size={16} />
             </Link>
             <Link href="/admin/notas" className="p-3 rounded-lg bg-slate-50 hover:bg-purple-50 flex items-center justify-between text-sm text-slate-600 hover:text-purple-700 transition-colors">
                <span>Lançar notas</span>
                <ArrowRight size={16} />
             </Link>
             <Link href="/admin/relatorios" className="p-3 rounded-lg bg-slate-50 hover:bg-purple-50 flex items-center justify-between text-sm text-slate-600 hover:text-purple-700 transition-colors">
                <span>Gerar Boletim</span>
                <ArrowRight size={16} />
             </Link>
          </div>
        </div>

        {/* LISTA DE ÚLTIMAS NOTAS (Agora Real!) */}
        <div className="bg-white rounded-2xl p-6 shadow border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Últimas Notas Lançadas</h3>
            <Link href="/admin/notas" className="text-xs font-medium text-purple-600 hover:underline">Ver tudo</Link>
          </div>
          
          {recentGrades.length === 0 ? (
            <p className="text-sm text-slate-400">Nenhuma nota lançada ainda.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {recentGrades.map((grade) => (
                <div key={grade.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-700">{grade.student.name}</span>
                    <span className="text-xs text-slate-500">{grade.subject.name} • {grade.class.name}</span>
                  </div>
                  <div className={`text-sm font-bold px-3 py-1 rounded-full ${
                    grade.value >= 6 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {grade.value.toFixed(1)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

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