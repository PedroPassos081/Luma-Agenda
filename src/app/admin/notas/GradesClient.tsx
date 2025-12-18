"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, Edit2, X, Calculator } from "lucide-react"; // Importe Edit2, X, Calculator
import { toast } from "sonner";
import { upsertGrade } from "./_actions/manageGrades";

type StudentData = {
  id: string;
  name: string;
  // Agora recebemos o objeto grade completo
  grade?: {
    testGrade: number;
    workGrade: number;
    behaviorGrade: number;
    value: number; // Média Final
  } | null;
};

type Props = {
  classes: { id: string; name: string }[];
  subjects: { id: string; name: string }[];
  students: StudentData[];
  selectedClassId?: string;
  selectedSubjectId?: string;
  selectedTerm?: string;
};

export default function GradesClient({ 
  classes, 
  subjects, 
  students, 
  selectedClassId, 
  selectedSubjectId, 
  selectedTerm = "1" 
}: Props) {
  const router = useRouter();
  
  // Estado para controlar qual aluno estamos editando (Modal)
  const [editingStudent, setEditingStudent] = useState<StudentData | null>(null);
  
  // Estados temporários para os inputs do Modal
  const [tempScores, setTempScores] = useState({ test: 0, work: 0, behavior: 0 });
  const [isPending, startTransition] = useTransition();

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(window.location.search);
    if (value) params.set(key, value);
    else params.delete(key);
    if (!params.get("term")) params.set("term", "1");
    router.push(`?${params.toString()}`);
  };

  // Abre o modal e carrega as notas existentes
  const openEditModal = (student: StudentData) => {
    setEditingStudent(student);
    setTempScores({
      test: student.grade?.testGrade ?? 0,
      work: student.grade?.workGrade ?? 0,
      behavior: student.grade?.behaviorGrade ?? 0,
    });
  };

  const handleSave = async () => {
    if (!selectedClassId || !selectedSubjectId || !selectedTerm || !editingStudent) return;

    const formData = new FormData();
    formData.append("studentId", editingStudent.id);
    formData.append("classId", selectedClassId);
    formData.append("subjectId", selectedSubjectId);
    formData.append("term", selectedTerm);
    // Envia as 3 notas
    formData.append("testGrade", tempScores.test.toString());
    formData.append("workGrade", tempScores.work.toString());
    formData.append("behaviorGrade", tempScores.behavior.toString());

    startTransition(async () => {
        try {
            await upsertGrade(formData);
            toast.success("Notas salvas e média calculada!");
            setEditingStudent(null); // Fecha o modal
        } catch (error) {
            console.error(error);
            toast.error("Erro ao salvar.");
        }
    });
  };

  // Calcula prévia da média em tempo real no modal
  const currentAverage = ((tempScores.test + tempScores.work + tempScores.behavior) / 3).toFixed(1);

  return (
    <div className="flex flex-col gap-6">
      {/* ... (CABEÇALHO E FILTROS IGUAIS AO ANTERIOR - MANTENHA O CÓDIGO) ... */}
      
      {/* Vou abreviar os filtros aqui para não ficar gigante, 
          mas MANTENHA a parte dos <select> igual você já tem! */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
         {/* ... (Seus selects de Turma, Disciplina e Período aqui) ... */}
         <div>
          <label className="text-xs font-bold text-slate-500 uppercase">Turma</label>
          <select className="w-full mt-1 p-2 rounded-lg border border-slate-200 text-sm" value={selectedClassId || ""} onChange={(e) => handleFilterChange("classId", e.target.value)}>
            <option value="">Selecione...</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">Disciplina</label>
          <select className="w-full mt-1 p-2 rounded-lg border border-slate-200 text-sm" value={selectedSubjectId || ""} onChange={(e) => handleFilterChange("subjectId", e.target.value)} disabled={!selectedClassId}>
            <option value="">Selecione...</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">Período</label>
          <select className="w-full mt-1 p-2 rounded-lg border border-slate-200 text-sm" value={selectedTerm} onChange={(e) => handleFilterChange("term", e.target.value)}>
             {[1,2,3,4].map(t => <option key={t} value={t}>{t}º Bimestre</option>)}
          </select>
        </div>
      </div>


      {/* TABELA DE ALUNOS */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {!selectedClassId || !selectedSubjectId ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center">
                <Search className="w-12 h-12 mb-2 opacity-20" />
                <p>Selecione Turma e Disciplina.</p>
            </div>
        ) : students.length === 0 ? (
            <div className="p-12 text-center text-slate-400">Nenhum aluno.</div>
        ) : (
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                    <tr>
                        <th className="px-6 py-4">Nome do Aluno</th>
                        <th className="px-6 py-4 text-center">Prova</th>
                        <th className="px-6 py-4 text-center">Trab.</th>
                        <th className="px-6 py-4 text-center">Part.</th>
                        <th className="px-6 py-4 text-center w-32 bg-purple-50 text-purple-700">Média</th>
                        <th className="px-6 py-4 w-20">Ação</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {students.map((student) => (
                        <tr key={student.id} className="hover:bg-slate-50/50">
                            <td className="px-6 py-4 font-medium text-slate-700">{student.name}</td>
                            
                            {/* Mostra as notas atuais (ou traço se não tiver) */}
                            <td className="px-6 py-4 text-center text-slate-500">{student.grade?.testGrade ?? "-"}</td>
                            <td className="px-6 py-4 text-center text-slate-500">{student.grade?.workGrade ?? "-"}</td>
                            <td className="px-6 py-4 text-center text-slate-500">{student.grade?.behaviorGrade ?? "-"}</td>
                            
                            {/* Média Final Destacada */}
                            <td className="px-6 py-4 text-center font-bold text-slate-900 bg-purple-50/30">
                                {student.grade?.value?.toFixed(1) ?? "-"}
                            </td>
                            
                            <td className="px-6 py-4 text-center">
                                <button 
                                  onClick={() => openEditModal(student)}
                                  className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                  title="Lançar Notas"
                                >
                                    <Edit2 size={18} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        )}
      </section>

      {/* MODAL DE EDIÇÃO */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header Modal */}
            <div className="bg-purple-600 p-6 flex justify-between items-start text-white">
              <div>
                <h3 className="text-lg font-bold">{editingStudent.name}</h3>
                <p className="text-purple-100 text-sm">Lançamento de notas do {selectedTerm}º Bimestre</p>
              </div>
              <button onClick={() => setEditingStudent(null)} className="text-white/80 hover:text-white">
                <X size={24} />
              </button>
            </div>

            {/* Inputs */}
            <div className="p-6 flex flex-col gap-5">
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Prova</label>
                  <input 
                    type="number" min="0" max="10" step="0.1"
                    className="w-full p-2 border rounded-lg text-center font-semibold focus:ring-2 focus:ring-purple-500 outline-none"
                    value={tempScores.test}
                    onChange={e => setTempScores({...tempScores, test: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Trabalho</label>
                  <input 
                    type="number" min="0" max="10" step="0.1"
                    className="w-full p-2 border rounded-lg text-center font-semibold focus:ring-2 focus:ring-purple-500 outline-none"
                    value={tempScores.work}
                    onChange={e => setTempScores({...tempScores, work: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Partic.</label>
                  <input 
                    type="number" min="0" max="10" step="0.1"
                    className="w-full p-2 border rounded-lg text-center font-semibold focus:ring-2 focus:ring-purple-500 outline-none"
                    value={tempScores.behavior}
                    onChange={e => setTempScores({...tempScores, behavior: Number(e.target.value)})}
                  />
                </div>
              </div>

              {/* Prévia da Média */}
              <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2 text-slate-500">
                  <Calculator size={20} />
                  <span className="text-sm font-medium">Média Calculada:</span>
                </div>
                <span className={`text-2xl font-bold ${Number(currentAverage) >= 6 ? 'text-green-600' : 'text-red-500'}`}>
                  {currentAverage}
                </span>
              </div>

              <button 
                onClick={handleSave}
                disabled={isPending}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-all disabled:opacity-70 flex justify-center"
              >
                {isPending ? "Salvando..." : "Confirmar Lançamento"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}