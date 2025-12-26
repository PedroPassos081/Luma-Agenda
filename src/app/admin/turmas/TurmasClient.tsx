"use client";

import { useState, useTransition, FormEvent } from "react";
import type { Class, Shift, Segment } from "@prisma/client";
import { toast } from "sonner";
import { Users, Pencil, Trash2, BookOpen, Plus, X, GraduationCap } from "lucide-react";

import { Modal } from "../../../components/Modal/Modal";
import { createClass } from "./_actions/createClass";
import { updateClass } from "./_actions/updateClass";
import { deleteClass } from "./_actions/deleteClass";
import { addSubjectToClass, removeSubjectFromClass } from "./_actions/manageGrade";
import { createClassSchema, type ClassPayload } from "./schema";

// TIPAGEM ATUALIZADA (subjects em vez de teachers)
type ClassWithRelations = Class & {
  _count: { students: number };
  subjects: {
    id: string;
    subject: { id: string; name: string };
    teacher: { id: string; name: string } | null;
  }[];
};

type Props = {
  classes: ClassWithRelations[];
  teachers: { id: string; name: string }[];
  subjects: { id: string; name: string }[];
  shiftLabel: Record<string, string>;
};

type Mode = "create" | "edit";

export default function TurmasClient({ classes, teachers, subjects, shiftLabel }: Props) {
  const [openClassModal, setOpenClassModal] = useState(false);
  const [classMode, setClassMode] = useState<Mode>("create");
  const [editingClass, setEditingClass] = useState<ClassWithRelations | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  
  const [gradeModalOpen, setGradeModalOpen] = useState(false);
  const [selectedClassForGrade, setSelectedClassForGrade] = useState<ClassWithRelations | null>(null);

  const [isPending, startTransition] = useTransition();

  const getError = (field: string) => fieldErrors[field]?.[0];

  const handleOpenCreate = () => {
    setClassMode("create");
    setEditingClass(null);
    setFieldErrors({});
    setOpenClassModal(true);
  };

  const handleOpenEdit = (classItem: ClassWithRelations) => {
    setClassMode("edit");
    setEditingClass(classItem);
    setFieldErrors({});
    setOpenClassModal(true);
  };

  const handleDelete = (id: string) => {
    if(!confirm("Tem certeza? Isso apagará a turma e todas as notas vinculadas.")) return;
    toast.promise(deleteClass(id), {
      loading: 'Excluindo...',
      success: 'Turma excluída!',
      error: 'Erro ao excluir.',
    });
  };

  const handleClassSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFieldErrors({});
    const formData = new FormData(event.currentTarget);

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
        if (classMode === "create") {
          await createClass(payload);
          toast.success("Turma criada!");
        } else if (classMode === "edit" && editingClass) {
          await updateClass({ id: editingClass.id, ...payload });
          toast.success("Turma atualizada!");
        }
        setOpenClassModal(false);
      } catch {
        toast.error("Erro ao salvar.");
      }
    });
  };

  const handleOpenGrade = (classItem: ClassWithRelations) => {
    setSelectedClassForGrade(classItem);
    setGradeModalOpen(true);
  };

  const handleAddSubject = (formData: FormData) => {
    if (!selectedClassForGrade) return;

    const subjectId = formData.get("subjectId") as string;
    const teacherId = formData.get("teacherId") as string;

    if (!subjectId) {
      toast.error("Selecione uma disciplina");
      return; // O return vazio corrige o erro de tipagem do 'action'
    }

    startTransition(async () => {
      const res = await addSubjectToClass({
        classId: selectedClassForGrade.id,
        subjectId,
        teacherId: teacherId || null
      });

      if (res.error) toast.error(res.error);
      else toast.success("Disciplina adicionada!");
    });
  };

  const handleRemoveSubject = (id: string) => {
    startTransition(async () => {
      await removeSubjectFromClass(id);
      toast.success("Removido da grade.");
    });
  };

  const inputClass = (hasError: boolean) => 
    `w-full rounded-lg border px-3 py-2 text-sm outline-none transition-all ${
      hasError ? "border-red-300 focus:border-red-500" : "border-slate-200 focus:border-[#7c3aed]"
    }`;

  return (
    <>
      <div className="flex flex-col gap-6">
        <header className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Turmas</h1>
            <p className="text-sm text-slate-500">Gerencie as turmas e suas grades curriculares.</p>
          </div>
          <button onClick={handleOpenCreate} className="bg-[#7c3aed] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#6d28d9] transition-colors flex items-center gap-2">
            <Plus size={18} /> Nova Turma
          </button>
        </header>

        <div className="grid gap-4 xl:grid-cols-3 lg:grid-cols-2">
          {classes.map((c) => (
            <div key={c.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow relative group">
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleOpenEdit(c)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md">
                  <Pencil size={16} />
                </button>
                <button onClick={() => handleDelete(c.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md">
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="pr-12">
                <h2 className="text-lg font-bold text-slate-800">{c.name}</h2>
                <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mt-1">
                  {c.grade} • {shiftLabel[c.shift]}
                </p>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Users size={16} className="text-slate-400" />
                  <span>{c._count.students} Alunos</span>
                </div>
                
                <div className="flex items-start gap-2 text-sm text-slate-600">
                  <BookOpen size={16} className="text-slate-400 mt-0.5" />
                  <div className="flex-1">
                    {c.subjects.length === 0 ? (
                      <span className="text-slate-400 italic">Grade vazia</span>
                    ) : (
                      <p className="line-clamp-2 text-xs leading-relaxed">
                        {c.subjects.map(s => s.subject.name).join(", ")}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <button 
                onClick={() => handleOpenGrade(c)}
                className="mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 hover:border-slate-300 transition-all"
              >
                <GraduationCap size={16} /> Gerenciar Grade
              </button>
            </div>
          ))}
        </div>
      </div>

      <Modal open={openClassModal} onClose={() => setOpenClassModal(false)}>
        <h2 className="text-lg font-bold text-slate-800 mb-4">
          {classMode === "create" ? "Nova Turma" : "Editar Turma"}
        </h2>
        <form onSubmit={handleClassSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600">Nome da Turma</label>
            <input name="name" defaultValue={editingClass?.name} placeholder="Ex: 6º Ano A" className={inputClass(!!getError('name'))} />
            {getError('name') && <span className="text-xs text-red-500">{getError('name')}</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Série</label>
              <input name="grade" defaultValue={editingClass?.grade} placeholder="Ex: 6º Ano" className={inputClass(!!getError('grade'))} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Ano Letivo</label>
              <input name="year" type="number" defaultValue={editingClass?.year || 2025} className={inputClass(!!getError('year'))} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Turno</label>
              <select name="shift" defaultValue={editingClass?.shift || ""} className={inputClass(!!getError('shift'))}>
                <option value="">Selecione</option>
                <option value="MORNING">Manhã</option>
                <option value="AFTERNOON">Tarde</option>
                <option value="EVENING">Noite</option>
                <option value="FULLTIME">Integral</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Segmento</label>
              <select name="segment" defaultValue={editingClass?.segment || ""} className={inputClass(!!getError('segment'))}>
                <option value="">Selecione</option>
                <option value="INFANTIL">Infantil</option>
                <option value="FUNDAMENTAL_I">Fund. I</option>
                <option value="FUNDAMENTAL_II">Fund. II</option>
                <option value="MEDIO">Ensino Médio</option>
              </select>
            </div>
          </div>

          <button disabled={isPending} className="w-full bg-[#7c3aed] text-white py-2.5 rounded-lg font-medium hover:bg-[#6d28d9] disabled:opacity-70 mt-2">
            {isPending ? "Salvando..." : "Salvar"}
          </button>
        </form>
      </Modal>

      <Modal open={gradeModalOpen} onClose={() => setGradeModalOpen(false)}>
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-800">Grade Curricular</h2>
          <p className="text-sm text-slate-500">
            {selectedClassForGrade?.name} ({selectedClassForGrade?.grade})
          </p>
        </div>

        <form action={handleAddSubject} className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3 mb-6">
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Adicionar Disciplina</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select name="subjectId" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white outline-none focus:border-[#7c3aed]">
              <option value="">Selecione a Matéria...</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            
            <select name="teacherId" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white outline-none focus:border-[#7c3aed]">
              <option value="">Sem Professor (Opcional)</option>
              {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <button disabled={isPending} className="w-full bg-slate-900 text-white py-2 rounded-lg text-xs font-bold uppercase tracking-wide hover:bg-slate-800 disabled:opacity-70">
             + Adicionar à Grade
          </button>
        </form>

        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {classes.find(c => c.id === selectedClassForGrade?.id)?.subjects.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-lg shadow-sm hover:border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-[#7c3aed]">
                  <BookOpen size={14} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">{item.subject.name}</p>
                  <p className="text-xs text-slate-500">
                    {item.teacher ? item.teacher.name : <span className="text-orange-500">Sem professor definido</span>}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => handleRemoveSubject(item.id)} 
                className="text-slate-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-full transition-colors"
                title="Remover disciplina"
              >
                <X size={16} />
              </button>
            </div>
          ))}
          
          {selectedClassForGrade?.subjects.length === 0 && (
             <p className="text-center text-sm text-slate-400 py-4">Nenhuma disciplina adicionada ainda.</p>
          )}
        </div>
      </Modal>
    </>
  );
}