"use client";

import { useState, useTransition, FormEvent } from "react";
import { X } from "lucide-react";
import type { Class, Shift, Segment } from "@prisma/client";
import { createClass, createClassSchema, type ClassPayload } from "./_actions/createClass";
import { updateClass } from "./_actions/updateClass";

// Tipos
export type ClassWithRelations = Class & {
  teacher?: { id: string; name: string | null } | null;
  _count?: { students: number };
};

type Mode = "create" | "edit";

type ClassModalProps = {
  mode: Mode;
  open: boolean;
  onClose: () => void;
  initialData?: ClassWithRelations | null;
};

export function ClassModal({ mode, open, onClose, initialData }: ClassModalProps) {
  const [isPending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Se não estiver aberto, não renderiza nada
  if (!open) return null;

  const getError = (field: string) => fieldErrors[field]?.[0];

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    const payload: ClassPayload = {
      name: (formData.get("name") as string) ?? "",
      grade: (formData.get("grade") as string) ?? "",
      year: Number(formData.get("year")),
      shift: formData.get("shift") as Shift,
      segment: formData.get("segment") as Segment,
    };

    const validation = createClassSchema.safeParse(payload);

    if (!validation.success) {
      setFieldErrors(validation.error.flatten().fieldErrors);
      return;
    }

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
        alert("Erro ao salvar.");
      }
    });
  }

  // Helper de estilo
  const inputClass = (hasError: boolean) =>
    `mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none transition-all ${
      hasError
        ? "border-red-300 focus:border-red-500 focus:ring-red-100"
        : "border-slate-200 focus:border-[#7B2CBF]/60 focus:ring-2 focus:ring-[#7B2CBF]/15"
    }`;

  const title = mode === "create" ? "Nova turma" : "Editar turma";
  const btnLabel = isPending ? "Salvando..." : mode === "create" ? "Criar turma" : "Salvar alterações";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          </div>
          <button onClick={onClose} type="button" className="p-1 text-slate-400 hover:bg-slate-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Nome */}
          <div>
            <label className="text-sm font-medium text-slate-700">Nome da turma</label>
            <input
              name="name"
              type="text"
              defaultValue={initialData?.name} // Usa defaultValue!
              className={inputClass(!!getError("name"))}
              placeholder='Ex: "5º Ano A"'
            />
            {getError("name") && <span className="text-xs text-red-500">{getError("name")}</span>}
          </div>

          {/* Série e Ano */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-700">Série</label>
              <input
                name="grade"
                type="text"
                defaultValue={initialData?.grade}
                className={inputClass(!!getError("grade"))}
                placeholder='Ex: "5º Ano"'
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Ano letivo</label>
              <input
                name="year"
                type="number"
                defaultValue={initialData?.year ?? new Date().getFullYear()}
                className={inputClass(!!getError("year"))}
              />
            </div>
          </div>

          {/* Turno e Segmento */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-700">Turno</label>
              <select name="shift" defaultValue={initialData?.shift ?? ""} className={inputClass(!!getError("shift"))}>
                <option value="">Selecione</option>
                <option value="MORNING">Manhã</option>
                <option value="AFTERNOON">Tarde</option>
                <option value="EVENING">Noite</option>
                <option value="FULLTIME">Integral</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Segmento</label>
              <select name="segment" defaultValue={initialData?.segment ?? ""} className={inputClass(!!getError("segment"))}>
                <option value="">Selecione</option>
                <option value="INFANTIL">Infantil</option>
                <option value="FUNDAMENTAL_I">Fundamental I</option>
                <option value="FUNDAMENTAL_II">Fundamental II</option>
                <option value="MEDIO">Ensino Médio</option>
              </select>
            </div>
          </div>

          {/* Botão Salvar */}
          <div className="flex justify-end gap-2 mt-2">
             <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">Cancelar</button>
             <button
               type="submit"
               disabled={isPending}
               className="bg-[#7B2CBF] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#6a23aa] disabled:opacity-50"
             >
               {btnLabel}
             </button>
          </div>

        </form>
      </div>
    </div>
  );
}