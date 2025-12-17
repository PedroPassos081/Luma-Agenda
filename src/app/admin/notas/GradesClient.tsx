"use client";

import { useTransition } from "react"; 
import { useRouter } from "next/navigation";
import { Search } from "lucide-react"; 
import { toast } from "sonner";
import { upsertGrade } from "./_actions/manageGrades";

type Props = {
  classes: { id: string; name: string }[];
  subjects: { id: string; name: string }[];
  students: {
    id: string;
    name: string;
    gradeValue?: number | null;
  }[];
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
  const [isPending, startTransition] = useTransition();

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(window.location.search);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    if (!params.get("term")) params.set("term", "1");
    
    router.push(`?${params.toString()}`);
  };

  const handleSave = async (studentId: string, value: string) => {
    if (!selectedClassId || !selectedSubjectId || !selectedTerm) return;
    if (value === "") return;

    const formData = new FormData();
    formData.append("studentId", studentId);
    formData.append("classId", selectedClassId);
    formData.append("subjectId", selectedSubjectId);
    formData.append("term", selectedTerm);
    formData.append("value", value);

    startTransition(async () => {
        try {
            await upsertGrade(formData);
            toast.success("Nota salva!");
        } catch (error) {
            console.error(error); 
            toast.error("Erro ao salvar nota.");
        }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">Lançamento de Notas</h1>
        <p className="text-sm text-slate-500">Selecione a turma e a disciplina para lançar as notas.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">Turma</label>
          <select 
            className="w-full mt-1 p-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-purple-500"
            value={selectedClassId || ""}
            onChange={(e) => handleFilterChange("classId", e.target.value)}
          >
            <option value="">Selecione a turma...</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">Disciplina</label>
          <select 
            className="w-full mt-1 p-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-purple-500"
            value={selectedSubjectId || ""}
            onChange={(e) => handleFilterChange("subjectId", e.target.value)}
            disabled={!selectedClassId}
          >
            <option value="">Selecione a disciplina...</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">Período</label>
          <select 
            className="w-full mt-1 p-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-purple-500"
            value={selectedTerm}
            onChange={(e) => handleFilterChange("term", e.target.value)}
          >
            <option value="1">1º Bimestre</option>
            <option value="2">2º Bimestre</option>
            <option value="3">3º Bimestre</option>
            <option value="4">4º Bimestre</option>
          </select>
        </div>
      </div>

      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {!selectedClassId || !selectedSubjectId ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center">
                <Search className="w-12 h-12 mb-2 opacity-20" />
                <p>Selecione uma Turma e uma Disciplina para começar.</p>
            </div>
        ) : students.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
                Nenhum aluno matriculado nesta turma.
            </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4">Nome do Aluno</th>
                            <th className="px-6 py-4 w-32 text-center">Nota (0-10)</th>
                            <th className="px-6 py-4 w-20"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {students.map((student) => (
                            <tr key={student.id} className="hover:bg-slate-50/50">
                                <td className="px-6 py-4 font-medium text-slate-700">
                                    {student.name}
                                </td>
                                <td className="px-6 py-4">
                                    <input 
                                        type="number"
                                        min="0"
                                        max="10"
                                        step="0.1"
                                        placeholder="-"
                                        defaultValue={student.gradeValue ?? ""}
                                        onBlur={(e) => handleSave(student.id, e.target.value)}
                                        disabled={isPending}
                                        className="w-full text-center p-2 rounded-lg border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition-all font-semibold disabled:opacity-50"
                                    />
                                </td>
                                <td className="px-6 py-4 text-center"></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </section>
    </div>
  );
}