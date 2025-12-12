"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Users as UsersIcon,
  User2,
  Pencil,
  Trash2,
  Mail,
  Phone,
} from "lucide-react";
import { Modal } from "../../../components/Modal/Modal";

export type StudentListItem = {
  id: string;
  name: string;
  birthDate: string | null;
  className: string;
  guardianName: string | null;
  guardianEmail: string | null;
  guardianPhone: string | null;
};

type Props = {
  students: StudentListItem[];
};

function StudentsClient({ students }: Props) {
  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);

  const filteredStudents = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return students;

    return students.filter((s) => {
      return (
        s.name.toLowerCase().includes(term) ||
        s.className.toLowerCase().includes(term) ||
        (s.guardianName ?? "").toLowerCase().includes(term) ||
        (s.guardianEmail ?? "").toLowerCase().includes(term)
      );
    });
  }, [search, students]);

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* Cabeçalho */}
        <header className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Alunos
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Gerencie os alunos da escola.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setOpenModal(true)}
            className="inline-flex items-center gap-2 rounded-full bg-[#7B2CBF] px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#6a23aa] transition-colors"
          >
            <span className="text-lg leading-none">+</span>
            Novo Aluno
          </button>
        </header>

        {/* Busca */}
        <div className="max-w-xl">
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar alunos..."
              className="w-full rounded-full border border-slate-200 bg-white px-9 py-2 text-sm text-slate-800 shadow-sm outline-none focus:border-[#7B2CBF]/60 focus:ring-2 focus:ring-[#7B2CBF]/15"
            />
          </div>
        </div>

        {/* Tabela / lista */}
        <div className="mt-2 rounded-3xl bg-white shadow-sm border border-slate-100 overflow-hidden">
          {/* Cabeçalho da tabela */}
          <div className="grid grid-cols-[minmax(0,3fr)_minmax(0,1.5fr)_minmax(0,2fr)_minmax(0,2fr)_minmax(0,1fr)] items-center gap-4 bg-slate-50 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <div className="flex items-center gap-2">
              <UsersIcon className="w-4 h-4" />
              <span>Aluno</span>
            </div>
            <span>Turma</span>
            <span>Responsável</span>
            <span>Contato</span>
            <span className="text-right">Ações</span>
          </div>

          {/* Linhas */}
          {filteredStudents.length === 0 ? (
            <div className="px-6 py-6 text-sm text-slate-500">
              Nenhum aluno encontrado.
            </div>
          ) : (
            filteredStudents.map((student, index) => (
              <div
                key={student.id}
                className={`grid grid-cols-[minmax(0,3fr)_minmax(0,1.5fr)_minmax(0,2fr)_minmax(0,2fr)_minmax(0,1fr)] items-center gap-4 px-6 py-4 text-sm ${
                  index !== filteredStudents.length - 1
                    ? "border-t border-slate-100"
                    : ""
                }`}
              >
                {/* Coluna: Aluno */}
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#7B2CBF]/10 text-[#7B2CBF]">
                    <User2 size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-900">
                      {student.name}
                    </span>
                    <span className="text-xs text-slate-500">
                      {student.birthDate
                        ? `Nascimento: ${student.birthDate}`
                        : "Nascimento não informado"}
                    </span>
                  </div>
                </div>

                {/* Coluna: Turma */}
                <div>
                  <span className="inline-flex rounded-full bg-[#f5ecff] px-3 py-1 text-xs font-medium text-[#7B2CBF]">
                    {student.className}
                  </span>
                </div>

                {/* Coluna: Responsável */}
                <div className="flex flex-col">
                  <span className="text-sm text-slate-800">
                    {student.guardianName ?? "Não informado"}
                  </span>
                </div>

                {/* Coluna: Contato */}
                <div className="flex flex-col gap-1 text-xs text-slate-600">
                  {student.guardianEmail ? (
                    <div className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      <span>{student.guardianEmail}</span>
                    </div>
                  ) : (
                    <span className="text-slate-400">E-mail não informado</span>
                  )}

                  {student.guardianPhone ? (
                    <div className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      <span>{student.guardianPhone}</span>
                    </div>
                  ) : (
                    <span className="text-slate-400">
                      Telefone não informado
                    </span>
                  )}
                </div>

                {/* Coluna: Ações */}
                <div className="flex items-center justify-end gap-3 text-slate-500">
                  <button
                    type="button"
                    className="hover:text-purple-600 transition-colors"
                    onClick={() => {
                      // aqui depois vamos abrir modal de edição
                      console.log("editar aluno", student.id);
                    }}
                  >
                    <Pencil size={18} strokeWidth={1.8} />
                  </button>
                  <button
                    type="button"
                    className="text-red-500 hover:text-red-600 transition-colors"
                    onClick={() => {
                      // ligar depois com a server action de delete
                      console.log("excluir aluno", student.id);
                    }}
                  >
                    <Trash2 size={18} strokeWidth={1.8} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal placeholder para "Novo Aluno" */}
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <h2 className="text-lg font-semibold text-slate-900 mb-2">
          Novo aluno
        </h2>
        <p className="text-sm text-slate-600">
          Aqui a gente ainda vai montar o formulário completo de cadastro
          (nome, data de nascimento, turma, responsável, contato etc).
        </p>
      </Modal>
    </>
  );
}

export default StudentsClient;
