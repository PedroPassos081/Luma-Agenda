"use client";

import { useMemo, useState, useTransition, FormEvent } from "react";
import { Search, Users as UsersIcon, User2, Pencil, Trash2, Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "../../../components/Modal/Modal";

import { createStudent } from "./_actions/createStudent";
import { updateStudent } from "./_actions/updateStudent";
import { deleteStudent } from "./_actions/deleteStudent";
import { createStudentSchema, type StudentPayload } from "./schema";

// Tipos
export type StudentListItem = {
  id: string;
  name: string;
  birthDate: Date | null;
  className: string;
  classId: string; // ID da turma atual (para o select)
  guardianName: string | null;
  guardianEmail: string | null;
  guardianPhone: string | null;
};

// Tipo simples para as turmas no select
type ClassOption = {
  id: string;
  name: string;
  grade: string;
  shift: string;
};

type Props = {
  students: StudentListItem[];
  classes: ClassOption[]; // Recebe as turmas disponíveis
};

type Mode = "create" | "edit";

// Helpers
function formatDateForInput(date: Date | null | undefined): string {
  if (!date) return "";
  return new Date(date).toISOString().split("T")[0];
}

function formatDateDisplay(date: Date | null | undefined): string {
  if (!date) return "Não informado";
  return new Date(date).toLocaleDateString("pt-BR");
}

function StudentsClient({ students, classes }: Props) {
  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [mode, setMode] = useState<Mode>("create");
  const [editingStudent, setEditingStudent] = useState<StudentListItem | null>(null);
  
  const [isPending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const getError = (field: string) => fieldErrors[field]?.[0];

  const filteredStudents = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return students;
    return students.filter((s) => 
      s.name.toLowerCase().includes(term) ||
      s.className.toLowerCase().includes(term) ||
      (s.guardianName ?? "").toLowerCase().includes(term)
    );
  }, [search, students]);

  const handleOpenCreate = () => {
    setMode("create");
    setEditingStudent(null);
    setFieldErrors({});
    setOpenModal(true);
  };

  const handleOpenEdit = (student: StudentListItem) => {
    setMode("edit");
    setEditingStudent(student);
    setFieldErrors({});
    setOpenModal(true);
  };

  const handleDelete = (id: string) => {
    toast.promise(deleteStudent(id), {
      loading: "Excluindo...",
      success: "Aluno excluído!",
      error: "Erro ao excluir.",
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFieldErrors({});
    const formData = new FormData(event.currentTarget);
    
    const payload: StudentPayload = {
      name: formData.get("name") as string,
      birthDate: new Date(formData.get("birthDate") as string),
      classId: formData.get("classId") as string, // Pegando o ID da turma
      guardianName: formData.get("guardianName") as string,
      guardianEmail: (formData.get("guardianEmail") as string) || undefined,
      guardianPhone: (formData.get("guardianPhone") as string) || undefined,
    };

    const validation = createStudentSchema.safeParse(payload);

    if (!validation.success) {
      setFieldErrors(validation.error.flatten().fieldErrors);
      return;
    }

    startTransition(async () => {
      try {
        if (mode === "create") {
          await createStudent(payload);
          toast.success("Aluno matriculado com sucesso!");
        } else if (mode === "edit" && editingStudent) {
          await updateStudent({ id: editingStudent.id, ...payload });
          toast.success("Matrícula atualizada!");
        }
        setOpenModal(false);
      } catch (error) {
        console.error(error);
        toast.error("Erro ao salvar.");
      }
    });
  };

  // Estilo dos inputs
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
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Alunos</h1>
            <p className="mt-1 text-sm text-slate-500">Gerencie as matrículas.</p>
            </div>
            <button onClick={handleOpenCreate} className="inline-flex items-center gap-2 rounded-full bg-[#7B2CBF] px-5 py-2 text-sm font-medium text-white hover:bg-[#6a23aa] transition-colors">
            <span className="text-lg leading-none">+</span> Novo Aluno
            </button>
        </header>

        {/* Busca e Tabela (Código igual ao anterior, omitido para focar no Modal) */}
        {/* ... Pode manter a parte de Busca e Tabela que já estava feita ... */}
        {/* Vou recolocar a tabela aqui para garantir que fique completo: */}
        
        <div className="max-w-xl">
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400"><Search className="w-4 h-4" /></span>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar alunos..." className="w-full rounded-full border border-slate-200 bg-white px-9 py-2 text-sm text-slate-800 shadow-sm outline-none focus:border-[#7B2CBF]/60 focus:ring-2 focus:ring-[#7B2CBF]/15" />
          </div>
        </div>

        <div className="mt-2 rounded-3xl bg-white shadow-sm border border-slate-100 overflow-hidden">
          <div className="grid grid-cols-[3fr_1.5fr_2fr_2fr_1fr] items-center gap-4 bg-slate-50 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <div className="flex items-center gap-2"><UsersIcon className="w-4 h-4" /><span>Aluno</span></div>
            <span>Turma</span>
            <span>Responsável</span>
            <span>Contato</span>
            <span className="text-right">Ações</span>
          </div>
          {filteredStudents.length === 0 ? (
            <div className="px-6 py-6 text-sm text-slate-500">Nenhum aluno encontrado.</div>
          ) : (
            filteredStudents.map((student, index) => (
              <div key={student.id} className={`grid grid-cols-[3fr_1.5fr_2fr_2fr_1fr] items-center gap-4 px-6 py-4 text-sm ${index !== filteredStudents.length - 1 ? "border-t border-slate-100" : ""}`}>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#7B2CBF]/10 text-[#7B2CBF]"><User2 size={18} /></div>
                  <div className="flex flex-col"><span className="font-medium text-slate-900">{student.name}</span><span className="text-xs text-slate-500">Nasc: {formatDateDisplay(student.birthDate)}</span></div>
                </div>
                <div>
                   {student.className !== "Sem turma" ? (
                    <span className="inline-flex rounded-full bg-[#f5ecff] px-3 py-1 text-xs font-medium text-[#7B2CBF]">{student.className}</span>
                   ) : <span className="text-xs text-slate-400 italic">Sem turma</span>}
                </div>
                <div className="flex flex-col"><span className="text-sm text-slate-800">{student.guardianName ?? "-"}</span></div>
                <div className="flex flex-col gap-1 text-xs text-slate-600">
                    {student.guardianEmail && <div className="flex items-center gap-1"><Mail className="w-3 h-3" /><span>{student.guardianEmail}</span></div>}
                    {student.guardianPhone && <div className="flex items-center gap-1"><Phone className="w-3 h-3" /><span>{student.guardianPhone}</span></div>}
                </div>
                <div className="flex items-center justify-end gap-3 text-slate-500">
                  <button onClick={() => handleOpenEdit(student)} className="hover:text-purple-600"><Pencil size={18}/></button>
                  <button onClick={() => handleDelete(student.id)} className="hover:text-red-600"><Trash2 size={18}/></button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <div key={editingStudent?.id ?? 'new'}>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">{mode === "create" ? "Matricular Aluno" : "Editar Aluno"}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600">Nome completo</label>
                    <input name="name" type="text" defaultValue={editingStudent?.name} className={inputClass(!!getError("name"))} placeholder="Ex: João Silva" />
                    {getError("name") && <span className="text-xs text-red-500">{getError("name")}</span>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-600">Data de Nascimento</label>
                        <input name="birthDate" type="date" defaultValue={formatDateForInput(editingStudent?.birthDate)} className={inputClass(!!getError("birthDate"))} />
                        {getError("birthDate") && <span className="text-xs text-red-500">{getError("birthDate")}</span>}
                    </div>

                    {/* O SELECT DE TURMA ENTROU AQUI */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-600">Turma</label>
                        <select 
                            name="classId" 
                            defaultValue={editingStudent?.classId ?? ""} 
                            className={inputClass(!!getError("classId"))}
                        >
                            <option value="" disabled>Selecione...</option>
                            {classes.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name} ({c.grade})
                                </option>
                            ))}
                        </select>
                        {getError("classId") && <span className="text-xs text-red-500">{getError("classId")}</span>}
                    </div>
                </div>

                <div className="my-2 h-px bg-slate-100" />
                
                <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600">Responsável</label>
                    <input name="guardianName" type="text" defaultValue={editingStudent?.guardianName ?? ""} className={inputClass(!!getError("guardianName"))} placeholder="Nome do pai/mãe" />
                    {getError("guardianName") && <span className="text-xs text-red-500">{getError("guardianName")}</span>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-600">E-mail</label>
                        <input name="guardianEmail" type="email" defaultValue={editingStudent?.guardianEmail ?? ""} className={inputClass(!!getError("guardianEmail"))} placeholder="email@exemplo.com" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-600">Telefone</label>
                        <input name="guardianPhone" type="text" defaultValue={editingStudent?.guardianPhone ?? ""} className={inputClass(!!getError("guardianPhone"))} placeholder="(99) 99999-9999" />
                    </div>
                </div>

                <button type="submit" disabled={isPending} className="mt-4 w-full rounded-lg bg-[#7B2CBF] py-2 text-sm font-medium text-white hover:bg-[#6a23aa] disabled:opacity-60">
                    {isPending ? "Salvando..." : "Salvar"}
                </button>
            </form>
        </div>
      </Modal>
    </>
  );
}

export default StudentsClient;