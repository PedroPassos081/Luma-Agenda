"use client";

import { useState } from "react";
import { Search, Users, Pencil, Trash2 } from "lucide-react";
import type { Class, User, Shift } from "@prisma/client";

type ClassWithTeacher = Class & {
  teacher: User | null;
  _count: {
    students: number;
  };
};

type Props = {
  classes: ClassWithTeacher[];
  shiftLabel: Record<Shift, string>;
};

function TurmasClient({ classes, shiftLabel }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      {/* Cabeçalho */}
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Turmas
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Gerencie as turmas da escola.
          </p>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center rounded-full bg-[#7B2CBF] px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#6a23aa] transition-colors"
        >
          + Nova Turma
        </button>
      </header>

      {/* Busca (ainda só visual) */}
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

      {/* Grid de turmas */}
      <section className="grid gap-4 xl:grid-cols-3 lg:grid-cols-2">
        {classes.map((classItem) => (
          <div
            key={classItem.id}
            className="
              group relative rounded-2xl bg-white shadow-sm border border-slate-100 
              px-6 py-5 flex flex-col justify-between 
              hover:shadow-md transition-all
            "
          >
            {/* Ícones de ação (hover) */}
            <div className="absolute top-4 right-4 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="text-slate-500 hover:text-purple-600 transition-colors">
                <Pencil size={18} strokeWidth={1.8} />
              </button>
              <button className="text-red-500 hover:text-red-600 transition-colors">
                <Trash2 size={18} strokeWidth={1.8} />
              </button>
            </div>

            {/* Conteúdo do card */}
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {classItem.name}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {classItem.grade} • {shiftLabel[classItem.shift]}
              </p>

              <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                <Users size={16} strokeWidth={1.7} />
                <span>{classItem._count.students} alunos</span>
              </div>

              <div className="mt-4 h-px w-full bg-slate-100" />

              <p className="mt-3 text-sm text-slate-600">
                Professor:{" "}
                <span className="font-medium text-slate-800">
                  {classItem.teacher?.name ?? "Não definido"}
                </span>
              </p>
            </div>
          </div>
        ))}

        {classes.length === 0 && (
          <p className="text-sm text-slate-500">
            Nenhuma turma cadastrada ainda.
          </p>
        )}
      </section>

    </div>
  );
}

export default TurmasClient;
