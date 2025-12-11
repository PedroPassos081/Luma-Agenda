"use client";

import { useEffect, useState, useTransition } from "react";
import type { Class, Shift, Segment } from "@prisma/client";
import { X } from "lucide-react";
import { createClass, type ClassPayload } from "./_actions/createClass";
import { updateClass } from "./_actions/updateClass";



export type ClassWithRelations = Class & {
  teacher?: { id: string; name: string | null } | null;
  _count?: { students: number };
};

type Mode = "create" | "edit";

type ClassModalProps = {
  mode: Mode;
  open: boolean;
  onClose: () => void;
  /** dados da turma quando for edição */
  initialData?: ClassWithRelations | null;
};

// ----------------------
// Labels bonitinhos
// ----------------------

const SHIFT_LABEL: Record<Shift, string> = {
  MORNING: "Manhã",
  AFTERNOON: "Tarde",
  EVENING: "Noite",
  FULLTIME: "Integral",
};

const SEGMENT_LABEL: Record<Segment, string> = {
  INFANTIL: "Educação Infantil",
  FUNDAMENTAL_I: "Fundamental I",
  FUNDAMENTAL_II: "Fundamental II",
  MEDIO: "Ensino Médio",
};

const SHIFT_OPTIONS = (Object.keys(SHIFT_LABEL) as Shift[]).map((value) => ({
  value,
  label: SHIFT_LABEL[value],
}));

const SEGMENT_OPTIONS = (Object.keys(SEGMENT_LABEL) as Segment[]).map(
  (value) => ({
    value,
    label: SEGMENT_LABEL[value],
  })
);

// ----------------------
// Componente
// ----------------------

export function ClassModal({ mode, open, onClose, initialData }: ClassModalProps) {
  const [isPending, startTransition] = useTransition();

  // estados do formulário
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [year, setYear] = useState<number | "">("");
  const [shift, setShift] = useState<Shift>("MORNING");
  const [segment, setSegment] = useState<Segment>("INFANTIL");
  const [error, setError] = useState<string | null>(null);

  // Preenche os campos quando abrir em modo edição
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
   if (open && mode === "edit" && initialData) {
    setName(initialData.name);
    setGrade(initialData.grade);
    setYear(initialData.year);
    setShift(initialData.shift);
    setSegment(initialData.segment);
    setError(null);
  }

  if (open && mode === "create") {
    setName("");
    setGrade("");
    setYear(new Date().getFullYear());
    setShift("MORNING");
    setSegment("FUNDAMENTAL_I");
    setError(null);
  }
}, [open, mode, initialData]);

  if (!open) return null;

  function handleClose() {
    if (isPending) return;
    onClose();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !grade.trim() || year === "") {
      setError("Preencha nome, série e ano letivo.");
      return;
    }

    const payload: ClassPayload = {
    name,
    grade,
    year: Number(year),
    shift,
    segment,
};

    startTransition(async () => {
      try {
        if (mode === "create") {
          await createClass(payload);
        } else if (mode === "edit" && initialData) {
          await updateClass({ id: initialData.id, ...payload });
        }

        onClose();
      } catch (err) {
        console.error(err);
        setError("Não foi possível salvar a turma. Tente novamente.");
      }
    });
  }

  const title = mode === "create" ? "Nova turma" : "Editar turma";
  const submitLabel = isPending
    ? mode === "create"
      ? "Criando..."
      : "Salvando..."
    : mode === "create"
    ? "Criar turma"
    : "Salvar alterações";

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
            <p className="text-xs text-slate-500">
              Defina os dados básicos da turma. Depois você poderá vincular
              alunos, professores e disciplinas.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome da turma */}
          <div>
            <label className="text-sm font-medium text-slate-700">
              Nome da turma
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='Ex.: "5º Ano A"'
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#7B2CBF]/60 focus:ring-2 focus:ring-[#7B2CBF]/15"
            />
          </div>

          {/* Série + ano */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-700">
                Série / ano escolar
              </label>
              <input
                type="text"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder='Ex.: "5º Ano"'
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#7B2CBF]/60 focus:ring-2 focus:ring-[#7B2CBF]/15"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Ano letivo
              </label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value ? Number(e.target.value) : "")}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#7B2CBF]/60 focus:ring-2 focus:ring-[#7B2CBF]/15"
              />
            </div>
          </div>

          {/* Turno + segmento */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-700">
                Turno
              </label>
              <select
                value={shift}
                onChange={(e) => setShift(e.target.value as Shift)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#7B2CBF]/60 focus:ring-2 focus:ring-[#7B2CBF]/15"
              >
                {SHIFT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Segmento
              </label>
              <select
                value={segment}
                onChange={(e) => setSegment(e.target.value as Segment)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#7B2CBF]/60 focus:ring-2 focus:ring-[#7B2CBF]/15"
              >
                {SEGMENT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Erro */}
          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
              {error}
            </p>
          )}

          {/* Botões */}
          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isPending}
              className="rounded-full border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-full bg-[#7B2CBF] px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#6a23aa] disabled:opacity-60"
            >
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
