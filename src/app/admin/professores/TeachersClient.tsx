"use client";

import { useMemo, useState, useTransition, FormEvent } from "react";
import { Search, Mail, Pencil, Trash2, KeyRound } from "lucide-react";
import type { Class, Subject, User } from "@prisma/client";
import { toast } from "sonner";
import { Modal } from "../../../components/Modal/Modal";

import { createTeacher } from "./_actions/createTeacher";
import { updateTeacher } from "./_actions/updateTeacher";
import { deleteTeacher } from "./_actions/deleteTeacher";
import { createTeacherSchema, type TeacherPayload } from "./schema";

type TeacherWithExtras = User & {
  teacherSubjects?: Subject[];
  teacherClasses?: Class[];
};

type Props = {
  teachers: TeacherWithExtras[];
  subjects: Subject[];
  classes: Class[];
};

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "T";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  return (first + last).toUpperCase();
};

function TeachersClient({ teachers, subjects, classes }: Props) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [selected, setSelected] = useState<TeacherWithExtras | null>(null);
  
  const [isPending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [query, setQuery] = useState("");

  const getError = (field: string) => fieldErrors[field]?.[0];

  const filteredTeachers = useMemo(() => {
    if (!query.trim()) return teachers;
    const q = query.toLowerCase();
    return teachers.filter((t) => {
      const inName = t.name?.toLowerCase().includes(q);
      const inEmail = t.email?.toLowerCase().includes(q);
      return Boolean(inName || inEmail);
    });
  }, [teachers, query]);

  const openCreate = () => {
    setMode("create");
    setSelected(null);
    setFieldErrors({});
    setOpen(true);
  };

  const openEdit = (teacher: TeacherWithExtras) => {
    setMode("edit");
    setSelected(teacher);
    setFieldErrors({});
    setOpen(true);
  };

  const handleDelete = (id: string) => {
    toast.promise(deleteTeacher(id), {
      loading: "Excluindo...",
      success: "Professor excluído!",
      error: "Erro ao excluir.",
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFieldErrors({});

    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload: TeacherPayload = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      // O getAll pega todos os checkboxes marcados com o mesmo name
      subjects: formData.getAll("subjects") as string[],
      classes: formData.getAll("classes") as string[],
    };

    const validation = createTeacherSchema.safeParse(payload);

    if (!validation.success) {
      setFieldErrors(validation.error.flatten().fieldErrors);
      return;
    }

    startTransition(async () => {
      try {
        if (mode === "create") {
          await createTeacher(payload);
          toast.success("Professor cadastrado!");
        } else if (mode === "edit" && selected) {
          await updateTeacher({ id: selected.id, ...payload });
          toast.success("Dados atualizados!");
        }
        setOpen(false);
      } catch (error) {
        console.error(error);
        toast.error("Erro ao salvar.");
      }
    });
  };

  const inputClass = (hasError: boolean) =>
    `w-full rounded-lg border px-3 py-2 text-sm outline-none transition-all ${
      hasError
        ? "border-red-300 focus:border-red-500 focus:ring-red-100 focus:ring-2"
        : "border-slate-200 focus:border-[#7B2CBF]/60 focus:ring-2 focus:ring-[#7B2CBF]/15"
    }`;

  // Helpers para verificar se está marcado (Checkboxes)
  const isSubjectSelected = (id: string) => 
    selected?.teacherSubjects?.some(s => s.id === id);

  const isClassSelected = (id: string) => 
    selected?.teacherClasses?.some(c => c.id === id);

  return (
    <>
      <div className="flex flex-col gap-6">
        <header className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Professores
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Gerencie o corpo docente.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center rounded-full bg-[#7B2CBF] px-5 py-2 text-sm font-medium text-white hover:bg-[#6a23aa] transition-colors"
          >
            + Novo Professor
          </button>
        </header>

        <div className="max-w-md relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="text"
            placeholder="Buscar por nome..."
            className="w-full rounded-full border border-slate-200 bg-white pl-9 pr-4 py-2 text-sm text-slate-800 shadow-sm outline-none focus:border-[#7B2CBF]/60 focus:ring-2 focus:ring-[#7B2CBF]/15"
          />
        </div>

        <section className="grid gap-4 xl:grid-cols-3 lg:grid-cols-2">
          {filteredTeachers.map((teacher) => {
            const initials = getInitials(teacher.name ?? "P");

            return (
              <article
                key={teacher.id}
                className="relative rounded-2xl bg-white shadow-sm border border-slate-100 px-6 py-5 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-[#7B2CBF]/10 text-[#7B2CBF] flex items-center justify-center text-lg font-bold">
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-base font-semibold text-slate-900 truncate">
                        {teacher.name}
                      </h2>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                        <Mail className="w-3.5 h-3.5" />
                        <span className="truncate">{teacher.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    {/* Tags Disciplinas */}
                    <div>
                         <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Disciplinas</p>
                         <div className="flex flex-wrap gap-1">
                            {teacher.teacherSubjects && teacher.teacherSubjects.length > 0 ? (
                                teacher.teacherSubjects.map(s => (
                                    <span key={s.id} className="text-[10px] px-2 py-0.5 bg-purple-50 text-purple-700 rounded-md border border-purple-100">{s.name}</span>
                                ))
                            ) : <span className="text-[11px] text-slate-400 italic">Nenhuma</span>}
                         </div>
                    </div>

                    {/* Tags Turmas */}
                    <div>
                         <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Turmas</p>
                         <div className="flex flex-wrap gap-1">
                            {teacher.teacherClasses && teacher.teacherClasses.length > 0 ? (
                                teacher.teacherClasses.map(c => (
                                    <span key={c.id} className="text-[10px] px-2 py-0.5 bg-slate-50 text-slate-600 rounded-md border border-slate-100">{c.name}</span>
                                ))
                            ) : <span className="text-[11px] text-slate-400 italic">Nenhuma</span>}
                         </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button type="button" className="text-xs font-medium text-slate-500 hover:text-[#7B2CBF] flex items-center gap-1.5">
                    <KeyRound size={14} /> Senha
                  </button>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(teacher)} className="p-1.5 text-slate-400 hover:text-[#7B2CBF] hover:bg-purple-50 rounded-lg">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => handleDelete(teacher.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      </div>

      <Modal open={open} onClose={() => setOpen(false)}>
        <div key={selected?.id ?? "new"}>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
            {mode === "create" ? "Novo Professor" : "Editar Professor"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600">Nome Completo</label>
                    <input
                    name="name"
                    type="text"
                    defaultValue={selected?.name ?? ""}
                    className={inputClass(!!getError("name"))}
                    />
                    {getError("name") && <span className="text-xs text-red-500">{getError("name")}</span>}
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600">Email de Acesso</label>
                    <input
                    name="email"
                    type="email"
                    defaultValue={selected?.email ?? ""}
                    className={inputClass(!!getError("email"))}
                    />
                    {getError("email") && <span className="text-xs text-red-500">{getError("email")}</span>}
                </div>

                {/* CHECKBOXES PARA DISCIPLINAS */}
                <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-600">Disciplinas</label>
                    <div className="max-h-32 overflow-y-auto rounded-lg border border-slate-200 p-3 space-y-2">
                        {subjects.length === 0 && <p className="text-xs text-slate-400">Nenhuma disciplina cadastrada.</p>}
                        {subjects.map((s) => (
                            <label key={s.id} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 rounded p-1">
                                <input 
                                    type="checkbox" 
                                    name="subjects" 
                                    value={s.id} 
                                    defaultChecked={isSubjectSelected(s.id)}
                                    className="accent-[#7B2CBF] w-4 h-4 rounded border-slate-300" 
                                />
                                <span className="text-sm text-slate-700">{s.name}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* CHECKBOXES PARA TURMAS */}
                <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-600">Turmas</label>
                    <div className="max-h-32 overflow-y-auto rounded-lg border border-slate-200 p-3 space-y-2">
                        {classes.length === 0 && <p className="text-xs text-slate-400">Nenhuma turma cadastrada.</p>}
                        {classes.map((c) => (
                            <label key={c.id} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 rounded p-1">
                                <input 
                                    type="checkbox" 
                                    name="classes" 
                                    value={c.id} 
                                    defaultChecked={isClassSelected(c.id)}
                                    className="accent-[#7B2CBF] w-4 h-4 rounded border-slate-300" 
                                />
                                <span className="text-sm text-slate-700">{c.name} <span className="text-xs text-slate-400">({c.grade})</span></span>
                            </label>
                        ))}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full mt-2 rounded-lg bg-[#7B2CBF] py-2.5 text-sm font-medium text-white hover:bg-[#6a23aa] disabled:opacity-60"
                >
                    {isPending ? "Salvando..." : "Salvar Dados"}
                </button>
            </form>
        </div>
      </Modal>
    </>
  );
}

export default TeachersClient;