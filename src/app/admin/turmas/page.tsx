import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { Search, Users, Pencil, Trash2 } from "lucide-react";


// Por enquanto, dados mockados só pra visual.
// Depois dá pra trocar por prisma.class.findMany(...)
const CLASSES: ClassItem[] = [
  {
    id: 1,
    name: "5º Ano A",
    grade: "5º Ano",
    shift: "Manhã",
    studentsCount: 28,
    teacher: "Prof. João Santos",
  },
  {
    id: 2,
    name: "5º Ano B",
    grade: "5º Ano",
    shift: "Manhã",
    studentsCount: 26,
    teacher: "Prof. João Santos",
  },
  {
    id: 3,
    name: "4º Ano A",
    grade: "4º Ano",
    shift: "Manhã",
    studentsCount: 30,
    teacher: "Profa. Maria Silva",
  },
];

type ClassItem = {
  id: number;
  name: string;          // 5º Ano A
  grade: string;         // 5º Ano
  shift: string;         // Manhã / Tarde / Noite
  studentsCount: number;
  teacher: string;
};

export default async function TurmasPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Cabeçalho da página */}
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Turmas
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Gerencie as turmas da escola.
          </p>
        </div>

        <button className="inline-flex items-center rounded-full bg-[#7B2CBF] px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#6a23aa] transition-colors">
          + Nova Turma
        </button>
      </header>

      {/* Campo de busca */}
      <div className="max-w-md">
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Buscar turmas..."
            className="w-full rounded-full border border-slate-200 bg-white px-9 py-2 text-sm text-slate-800 shadow-sm outline-none focus:border-[#7B2CBF]/60 focus:ring-2 focus:ring-[#7B2CBF]/15"
          />
        </div>
      </div>

      {/* Grid de cards de turmas */}
      <section className="grid gap-4 xl:grid-cols-3 lg:grid-cols-2">
        {CLASSES.map((classItem) => (
        <div
  key={classItem.id}
  className="
    group relative rounded-2xl bg-white shadow-sm border border-slate-100 
    px-6 py-5 flex flex-col justify-between 
    hover:shadow-md transition-all
  "
>
  {/* ÍCONES VISÍVEIS APENAS NO HOVER */}
  <div className="
    absolute top-4 right-4 flex items-center gap-3
    opacity-0 group-hover:opacity-100 transition-opacity
  ">
    <button className="text-slate-500 hover:text-purple-600 transition-colors">
      <Pencil size={18} strokeWidth={1.8} />
    </button>

    <button className="text-red-500 hover:text-red-600 transition-colors">
      <Trash2 size={18} strokeWidth={1.8} />
    </button>
  </div>

  {/* CONTEÚDO DO CARD */}
  <div>
    <h2 className="text-lg font-semibold text-slate-900">
      {classItem.name}
    </h2>
    <p className="mt-1 text-sm text-slate-500">
      {classItem.grade} • {classItem.shift}
    </p>

    <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
      <Users size={16} strokeWidth={1.7} />
      <span>{classItem.studentsCount} alunos</span>
    </div>

    <div className="mt-4 h-px bg-slate-100 w-full" />

    <p className="mt-3 text-sm text-slate-600">
      Professor:{" "}
      <span className="font-medium text-slate-800">
        {classItem.teacher}
      </span>
    </p>
  </div>
</div>

        ))}
      </section>
    </div>
  );
}
