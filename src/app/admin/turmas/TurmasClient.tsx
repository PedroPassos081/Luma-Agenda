"use client";

import { useState, useTransition, FormEvent } from "react";
import { Search, Users, Pencil, Trash2 } from "lucide-react";
import type { Class, User, Shift, Segment } from "@prisma/client";
import { Modal } from "../../../components/Modal/Modal";
import { createClass, type ClassPayload } from "./_actions/createClass";
import { updateClass } from "./_actions/updateClass";
import { deleteClass } from "./_actions/deleteClass";

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

type Mode = "create" | "edit";

function TurmasClient({ classes, shiftLabel }: Props) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("create");
  const [editingClass, setEditingClass] = useState<ClassWithTeacher | null>(
    null
  );
  const [isPending, startTransition] = useTransition();

  // Abrir modal em modo criação
  const handleOpenCreate = () => {
    setMode("create");
    setEditingClass(null);
    setOpen(true);
  };

  // Abrir modal em modo edição
  const handleOpenEdit = (classItem: ClassWithTeacher) => {
    setMode("edit");
    setEditingClass(classItem);
    setOpen(true);
  };

  // Excluir turma
  const handleDelete = (id: string) => {
    const ok = window.confirm(
      "Tem certeza que deseja excluir esta turma? Essa ação não pode ser desfeita."
    );
    if (!ok) return;

    startTransition(async () => {
      await deleteClass(id);
      // revalidatePath já é chamado dentro da server action
    });
  };

  // Criar / editar turma
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    const basePayload: ClassPayload = {
      name: (formData.get("name") as string) ?? "",
      grade: (formData.get("grade") as string) ?? "",
      year: Number(formData.get("year")),
      shift: formData.get("shift") as Shift,
      segment: formData.get("segment") as Segment,
    };

    startTransition(async () => {
      if (mode === "create") {
        await createClass(basePayload);
      } else if (mode === "edit" && editingClass) {
        await updateClass({
          id: editingClass.id,
          ...basePayload,
        });
      }

      form.reset();
      setEditingClass(null);
      setMode("create");
      setOpen(false);
    });
  };

  return (
    <>
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
            type="button"
            onClick={handleOpenCreate}
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
              className="group relative rounded-2xl bg-white shadow-sm border border-slate-100 px-6 py-5 flex flex-col justify-between hover:shadow-md transition-all"
            >
              {/* Ícones de ação (hover) */}
              <div className="absolute top-4 right-4 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(classItem)}
                  className="text-slate-500 hover:text-purple-600 transition-colors"
                >
                  <Pencil size={18} strokeWidth={1.8} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(classItem.id)}
                  className="text-red-500 hover:text-red-600 transition-colors"
                >
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

      {/* Modal de criação/edição de turma */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          {mode === "create" ? "Criar nova turma" : "Editar turma"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">
              Nome da turma
            </label>
            <input
              name="name"
              type="text"
              placeholder="Ex: 5º Ano A"
              defaultValue={editingClass?.name ?? ""}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#7B2CBF]/60 focus:ring-2 focus:ring-[#7B2CBF]/15"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">
              Série / Ano
            </label>
            <input
              name="grade"
              type="text"
              placeholder="Ex: 5º Ano"
              defaultValue={editingClass?.grade ?? ""}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#7B2CBF]/60 focus:ring-2 focus:ring-[#7B2CBF]/15"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">
              Ano letivo
            </label>
            <input
              name="year"
              type="number"
              placeholder="2025"
              defaultValue={editingClass?.year ?? ""}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#7B2CBF]/60 focus:ring-2 focus:ring-[#7B2CBF]/15"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">
              Turno
            </label>
            <select
              name="shift"
              defaultValue={editingClass?.shift ?? ""}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#7B2CBF]/60 focus:ring-2 focus:ring-[#7B2CBF]/15"
              required
            >
              <option value="">Selecione</option>
              <option value="MORNING">Manhã</option>
              <option value="AFTERNOON">Tarde</option>
              <option value="EVENING">Noite</option>
              <option value="FULLTIME">Integral</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">
              Segmento
            </label>
            <select
              name="segment"
              defaultValue={editingClass?.segment ?? ""}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#7B2CBF]/60 focus:ring-2 focus:ring-[#7B2CBF]/15"
              required
            >
              <option value="">Selecione</option>
              <option value="INFANTIL">Infantil</option>
              <option value="FUNDAMENTAL_I">Fundamental I</option>
              <option value="FUNDAMENTAL_II">Fundamental II</option>
              <option value="MEDIO">Ensino Médio</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="mt-2 w-full rounded-lg bg-[#7B2CBF] py-2 text-sm font-medium text-white hover:bg-[#6a23aa] transition-colors disabled:opacity-60"
          >
            {isPending
              ? mode === "create"
                ? "Criando..."
                : "Salvando..."
              : mode === "create"
              ? "Criar turma"
              : "Salvar alterações"}
          </button>
        </form>
      </Modal>
    </>
  );
}

export default TurmasClient;
