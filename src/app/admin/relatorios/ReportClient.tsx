"use client";

import { useRouter } from "next/navigation";
import { FileText, Printer } from "lucide-react";

type GradeMap = {
  subjectName: string;
  term1?: number | null;
  term2?: number | null;
  term3?: number | null;
  term4?: number | null;
  average?: number;
};

type Props = {
  classes: { id: string; name: string }[];
  students: { id: string; name: string }[];
  selectedClassId?: string;
  selectedStudentId?: string;
  reportData: GradeMap[]; // Dados processados do boletim
};

export default function ReportClient({
  classes,
  students,
  selectedClassId,
  selectedStudentId,
  reportData,
}: Props) {
  const router = useRouter();

  // Atualiza URL ao mudar filtros
  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(window.location.search);
    if (value) {
      params.set(key, value);
      // Se mudou a turma, limpa o aluno selecionado
      if (key === "classId") params.delete("studentId");
    } else {
      params.delete(key);
    }
    router.push(`?${params.toString()}`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-6 print:p-0">
      {/* HEADER E FILTROS (Escondidos na impressão) */}
      <div className="print:hidden flex flex-col gap-6">
        <header>
          <h1 className="text-2xl font-semibold text-slate-900">Boletim Escolar</h1>
          <p className="text-sm text-slate-500">Selecione um aluno para gerar o relatório.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          {/* Seleção de Turma */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Turma</label>
            <select
              className="w-full mt-1 p-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-purple-500"
              value={selectedClassId || ""}
              onChange={(e) => handleFilterChange("classId", e.target.value)}
            >
              <option value="">Selecione a turma...</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Seleção de Aluno */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Aluno</label>
            <select
              className="w-full mt-1 p-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-purple-500 disabled:bg-slate-50"
              value={selectedStudentId || ""}
              onChange={(e) => handleFilterChange("studentId", e.target.value)}
              disabled={!selectedClassId}
            >
              <option value="">Selecione o aluno...</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ÁREA DO BOLETIM (O que aparece na tela e na impressão) */}
      {selectedStudentId && reportData.length > 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden print:border-none print:shadow-none">
          {/* Cabeçalho do Boletim */}
          <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50 print:bg-white">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Relatório de Desempenho</h2>
              <p className="text-sm text-slate-500 mt-1">Ano Letivo 2024</p>
            </div>
            <button 
              onClick={handlePrint}
              className="print:hidden flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-purple-600 border border-slate-200 bg-white px-3 py-1.5 rounded-lg shadow-sm"
            >
              <Printer size={16} /> Imprimir
            </button>
          </div>

          {/* Tabela de Notas */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4 w-1/3">Disciplina</th>
                  <th className="px-4 py-4 text-center">1º Bim</th>
                  <th className="px-4 py-4 text-center">2º Bim</th>
                  <th className="px-4 py-4 text-center">3º Bim</th>
                  <th className="px-4 py-4 text-center">4º Bim</th>
                  <th className="px-4 py-4 text-center bg-purple-50 text-purple-700">Média Final</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportData.map((row) => (
                  <tr key={row.subjectName} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-medium text-slate-800">{row.subjectName}</td>
                    <td className="px-4 py-4 text-center text-slate-600">{row.term1 ?? "-"}</td>
                    <td className="px-4 py-4 text-center text-slate-600">{row.term2 ?? "-"}</td>
                    <td className="px-4 py-4 text-center text-slate-600">{row.term3 ?? "-"}</td>
                    <td className="px-4 py-4 text-center text-slate-600">{row.term4 ?? "-"}</td>
                    <td className="px-4 py-4 text-center font-bold bg-purple-50/30 text-slate-900">
                      {row.average ? row.average.toFixed(1) : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-6 text-xs text-slate-400 text-center border-t border-slate-100">
             Documento gerado eletronicamente pelo sistema Luma Agenda.
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-slate-400 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>{selectedClassId ? "Selecione um aluno para ver o boletim." : "Selecione uma turma para começar."}</p>
        </div>
      )}
    </div>
  );
}