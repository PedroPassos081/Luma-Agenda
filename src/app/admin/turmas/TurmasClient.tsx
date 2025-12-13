"use client";

import { useState, useTransition, FormEvent } from "react";
import { Users, Pencil, Trash2 } from "lucide-react";
import type { Class, User, Shift, Segment } from "@prisma/client";
import { Modal } from "../../../components/Modal/Modal";
import { createClass } from "./_actions/createClass";
import { updateClass } from "./_actions/updateClass";
import { deleteClass } from "./_actions/deleteClass";
import { createClassSchema, type ClassPayload } from "./schema";

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
  const [editingClass, setEditingClass] = useState<ClassWithTeacher | null>(null);
  
  
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isPending, startTransition] = useTransition();

  const getError = (field: string) => fieldErrors[field]?.[0];

  const handleOpenCreate = () => {
    setMode("create");
    setEditingClass(null);
    setFieldErrors({});
    setOpen(true);
  };

  const handleOpenEdit = (classItem: ClassWithTeacher) => {
    setMode("edit");
    setEditingClass(classItem);
    setFieldErrors({});
    setOpen(true);
  };

  const handleDelete = (id: string) => {
    const ok = window.confirm(
      "Tem certeza que deseja excluir esta turma? Essa ação não pode ser desfeita."
    );
    if (!ok) return;

    startTransition(async () => {
      await deleteClass(id);
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFieldErrors({});

    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload: ClassPayload = {
      name: (formData.get("name") as string) ?? "",
      grade: (formData.get("grade") as string) ?? "",
      year: Number(formData.get("year")),
      shift: formData.get("shift") as Shift,
      segment: formData.get("segment") as Segment,
    };

    // Validação Zod
    const validation = createClassSchema.safeParse(payload);

    if (!validation.success) {
      setFieldErrors(validation.error.flatten().fieldErrors);
      return;
    }

    startTransition(async () => {
      try {
        if (mode === "create") {
          await createClass(payload);
        } else if (mode === "edit" && editingClass) {
          await updateClass({
            id: editingClass.id,
            ...payload,
          });
        }
        setOpen(false);
      } catch (error) {
        console.error("Erro ao salvar:", error);
        alert("Erro ao salvar a turma.");
      }
    });
  };

  const inputClass = (hasError: boolean) => 
    `w-full rounded-lg border px-3 py-2 text-sm outline-none transition-all ${
      hasError 
        ? "border-red-300 focus:border-red-500 focus:ring-red-100 focus:ring-2" 
        : "border-slate-200 focus:border-[#7B2CBF]/60 focus:ring-2 focus:ring-[#7B2CBF]/15"
    }`;

  return (
    <>
      <div className="flex flex-col gap-6">
        <header className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Turmas</h1>
            <p className="mt-1 text-sm text-slate-500">Gerencie as turmas da escola.</p>
          </div>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center rounded-full bg-[#7B2CBF] px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#6a23aa] transition-colors"
          >
            + Nova Turma
          </button>
        </header>

        
        <div className="max-w-md">
           {/* ... busca ... */}
        </div>

        <section className="grid gap-4 xl:grid-cols-3 lg:grid-cols-2">
            {classes.map((classItem) => (
             <div key={classItem.id} className="group relative rounded-2xl bg-white shadow-sm border border-slate-100 px-6 py-5 flex flex-col justify-between hover:shadow-md transition-all">
                <div className="absolute top-4 right-4 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button type="button" onClick={() => handleOpenEdit(classItem)} className="text-slate-500 hover:text-purple-600">
                        <Pencil size={18} strokeWidth={1.8} />
                    </button>
                    <button type="button" onClick={() => handleDelete(classItem.id)} className="text-red-500 hover:text-red-600">
                        <Trash2 size={18} strokeWidth={1.8} />
                    </button>
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-slate-900">{classItem.name}</h2>
                    <p className="mt-1 text-sm text-slate-500">{classItem.grade} • {shiftLabel[classItem.shift]}</p>
                    <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                        <Users size={16} strokeWidth={1.7} />
                        <span>{classItem._count.students} alunos</span>
                    </div>
                </div>
             </div>
            ))}
        </section>
      </div>

      <Modal open={open} onClose={() => setOpen(false)}>
        <div key={editingClass?.id ?? 'new'}>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
            {mode === "create" ? "Criar nova turma" : "Editar turma"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Nome da turma</label>
                <input
                    name="name"
                    type="text"
                    placeholder="Ex: 5º Ano A"
                    defaultValue={editingClass?.name} 
                    className={inputClass(!!getError('name'))}
                />
                {getError('name') && <span className="text-xs text-red-500">{getError('name')}</span>}
            </div>

            <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Série / Ano</label>
                <input
                    name="grade"
                    type="text"
                    placeholder="Ex: 5º Ano"
                    defaultValue={editingClass?.grade}
                    className={inputClass(!!getError('grade'))}
                />
                {getError('grade') && <span className="text-xs text-red-500">{getError('grade')}</span>}
            </div>

            <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Ano letivo</label>
                <input
                    name="year"
                    type="number"
                    placeholder="2025"
                    defaultValue={editingClass?.year}
                    className={inputClass(!!getError('year'))}
                />
                {getError('year') && <span className="text-xs text-red-500">{getError('year')}</span>}
            </div>

            <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Turno</label>
                <select
                    name="shift"
                    defaultValue={editingClass?.shift ?? ""}
                    className={inputClass(!!getError('shift'))}
                >
                    <option value="">Selecione</option>
                    <option value="MORNING">Manhã</option>
                    <option value="AFTERNOON">Tarde</option>
                    <option value="EVENING">Noite</option>
                    <option value="FULLTIME">Integral</option>
                </select>
                {getError('shift') && <span className="text-xs text-red-500">{getError('shift')}</span>}
            </div>

            <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Segmento</label>
                <select
                    name="segment"
                    defaultValue={editingClass?.segment ?? ""}
                    className={inputClass(!!getError('segment'))}
                >
                    <option value="">Selecione</option>
                    <option value="INFANTIL">Infantil</option>
                    <option value="FUNDAMENTAL_I">Fundamental I</option>
                    <option value="FUNDAMENTAL_II">Fundamental II</option>
                    <option value="MEDIO">Ensino Médio</option>
                </select>
                {getError('segment') && <span className="text-xs text-red-500">{getError('segment')}</span>}
            </div>

            <button
                type="submit"
                disabled={isPending}
                className="mt-2 w-full flex items-center justify-center gap-2 rounded-lg bg-[#7B2CBF] py-2 text-sm font-medium text-white hover:bg-[#6a23aa] transition-colors disabled:opacity-60"
            >
                {isPending && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
                {isPending
                ? (mode === "create" ? "Criando..." : "Salvando...")
                : (mode === "create" ? "Criar turma" : "Salvar alterações")}
            </button>
            </form>
        </div>
      </Modal>
    </>
  );
}

export default TurmasClient;