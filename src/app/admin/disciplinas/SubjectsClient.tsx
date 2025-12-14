"use client";

import { useMemo, useState, useTransition, FormEvent } from "react";
import { Search, BookOpen, Pencil, Trash2, } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "../../../components/Modal/Modal";

import { createSubject } from "./_actions/createSubject";
import { updateSubject } from "./_actions/updateSubject";
import { deleteSubject } from "./_actions/deleteSubject";
import { subjectSchema, type SubjectPayload } from "./schema";

// Tipo para os dados vindos do Prisma
type SubjectItem = {
  id: string;
  name: string;
  code: string | null;
  _count: {
    teachers: number; // Vamos mostrar quantos professores dão essa aula
  };
};

type Props = {
  subjects: SubjectItem[];
};

// Cores para os ícones (para ficar igual a imagem: azul, verde, roxo, amarelo)
const COLORS = [
  { bg: "bg-blue-50", text: "text-blue-600" },
  { bg: "bg-green-50", text: "text-green-600" },
  { bg: "bg-purple-50", text: "text-purple-600" },
  { bg: "bg-yellow-50", text: "text-yellow-600" },
  { bg: "bg-pink-50", text: "text-pink-600" },
  { bg: "bg-orange-50", text: "text-orange-600" },
];

export default function SubjectsClient({ subjects }: Props) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editingSubject, setEditingSubject] = useState<SubjectItem | null>(null);
  const [query, setQuery] = useState("");

  const [isPending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const getError = (field: string) => fieldErrors[field]?.[0];

  // Filtro
  const filteredSubjects = useMemo(() => {
    if (!query.trim()) return subjects;
    return subjects.filter((s) =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      (s.code && s.code.toLowerCase().includes(query.toLowerCase()))
    );
  }, [subjects, query]);

  // Handlers
  const handleOpenCreate = () => {
    setMode("create");
    setEditingSubject(null);
    setFieldErrors({});
    setOpen(true);
  };

  const handleOpenEdit = (subject: SubjectItem) => {
    setMode("edit");
    setEditingSubject(subject);
    setFieldErrors({});
    setOpen(true);
  };

  const handleDelete = (id: string) => {
    toast.promise(deleteSubject(id), {
      loading: "Excluindo...",
      success: "Disciplina excluída!",
      error: "Erro ao excluir.",
    });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFieldErrors({});
    const formData = new FormData(e.currentTarget);
    const payload: SubjectPayload = {
      name: formData.get("name") as string,
      code: formData.get("code") as string,
    };

    const validation = subjectSchema.safeParse(payload);
    if (!validation.success) {
      setFieldErrors(validation.error.flatten().fieldErrors);
      return;
    }

    startTransition(async () => {
      try {
        if (mode === "create") {
          await createSubject(payload);
          toast.success("Disciplina criada!");
        } else if (mode === "edit" && editingSubject) {
          await updateSubject({ id: editingSubject.id, ...payload });
          toast.success("Disciplina atualizada!");
        }
        setOpen(false);
      } catch (error) {
        console.error(error);
        toast.error("Erro ao salvar.");
      }
    });
  };

  // Helper de estilo para inputs
  const inputClass = (err: boolean) =>
    `w-full rounded-lg border px-3 py-2 text-sm outline-none transition-all ${
      err
        ? "border-red-300 focus:ring-2 focus:ring-red-100"
        : "border-slate-200 focus:ring-2 focus:ring-[#7B2CBF]/15 focus:border-[#7B2CBF]/60"
    }`;

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <header className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Disciplinas
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Gerencie as disciplinas da escola.
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="rounded-full bg-[#7B2CBF] px-5 py-2 text-sm font-medium text-white hover:bg-[#6a23aa] transition-colors"
          >
            + Nova Disciplina
          </button>
        </header>

        {/* Search */}
        <div className="max-w-md relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="text"
            placeholder="Buscar disciplinas..."
            className="w-full rounded-full border border-slate-200 bg-white pl-9 pr-4 py-2 text-sm text-slate-800 shadow-sm outline-none focus:border-[#7B2CBF]/60 focus:ring-2 focus:ring-[#7B2CBF]/15"
          />
        </div>

        {/* GRID DE CARDS (O Ponto principal do Design) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredSubjects.map((sub, index) => {
            // Pega uma cor baseada no índice (ciclico)
            const color = COLORS[index % COLORS.length];

            return (
              <div
                key={sub.id}
                className="group relative flex flex-col justify-between rounded-2xl bg-white p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all h-[180px]"
              >
                {/* Ícone e Botões de Ação (Aparecem no hover) */}
                <div className="flex justify-between items-start">
                  <div className={`h-12 w-12 rounded-2xl ${color.bg} ${color.text} flex items-center justify-center`}>
                    <BookOpen size={22} />
                  </div>
                  
                  {/* Botões de ação sutis */}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenEdit(sub)} className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => handleDelete(sub.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Conteúdo */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 truncate" title={sub.name}>
                    {sub.name}
                  </h3>
                  <p className="text-sm text-slate-400 font-medium">
                    Código: {sub.code || "---"}
                  </p>
                </div>

                {/* Footer do Card */}
                <div className="text-xs text-slate-500 font-medium">
                  {sub._count.teachers} professores vinculados
                </div>
              </div>
            );
          })}
          
          {/* Empty State */}
          {filteredSubjects.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-100 border-dashed">
              Nenhuma disciplina encontrada.
            </div>
          )}
        </section>
      </div>

      {/* Modal Form */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <div key={editingSubject?.id ?? "new"}>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            {mode === "create" ? "Nova Disciplina" : "Editar Disciplina"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-600">Nome da Matéria</label>
              <input
                name="name"
                defaultValue={editingSubject?.name}
                placeholder="Ex: Matemática"
                className={inputClass(!!getError("name"))}
              />
              {getError("name") && <span className="text-xs text-red-500">{getError("name")}</span>}
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600">Código / Sigla</label>
              <input
                name="code"
                defaultValue={editingSubject?.code ?? ""}
                placeholder="Ex: MAT"
                maxLength={5}
                className={inputClass(!!getError("code"))}
              />
              <p className="text-[10px] text-slate-400 mt-1">Aparece nos cards (Máx 5 letras)</p>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-[#7B2CBF] text-white py-2 rounded-lg text-sm font-medium hover:bg-[#6a23aa] disabled:opacity-50"
            >
              {isPending ? "Salvando..." : "Salvar"}
            </button>
          </form>
        </div>
      </Modal>
    </>
  );
}