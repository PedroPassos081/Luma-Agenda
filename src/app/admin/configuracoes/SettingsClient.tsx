"use client";

import { useState, useRef, useTransition, ChangeEvent, ReactNode } from "react";
import { updateSettings } from "./_actions/updateSettings";
import { toast } from "sonner";
import { Save, Upload, School, GraduationCap, Settings as SettingsIcon, Loader2 } from "lucide-react";

// Tipagem dos dados (baseado no Prisma)
type Settings = {
  id: string;
  schoolName: string;
  schoolLogo: string | null;
  cnpj: string | null;
  address: string | null;
  phone: string | null;
  currentYear: string;
  passingGrade: number;
  periodicity: string;
  minFrequency: number;
  isGradesVisible: boolean;
  isMaintenance: boolean;
};

// 1. Definição das Props dos Componentes Auxiliares
interface TabButtonProps {
  isActive: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
}

// "Herda" todas as propriedades de um <input> nativo HTML
interface InputGroupProps extends React.ComponentProps<"input"> {
  label: string;
}

interface ToggleItemProps {
  title: string;
  description: string;
  name: string;
  defaultChecked?: boolean;
  danger?: boolean;
}

export default function SettingsClient({ initialData }: { initialData: Settings | null }) {
  const [activeTab, setActiveTab] = useState<"perfil" | "academico" | "sistema">("perfil");
  const [isPending, startTransition] = useTransition();
  const [logoPreview, setLogoPreview] = useState<string | null>(initialData?.schoolLogo || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Valores padrão
  const data = initialData || {
    schoolName: "Minha Escola",
    currentYear: "2025",
    passingGrade: 6.0,
    minFrequency: 75.0,
    periodicity: "BIMESTRAL",
    isGradesVisible: false,
    isMaintenance: false,
    schoolLogo: null,
    cnpj: "",
    address: "",
    phone: ""
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setLogoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      try {
        await updateSettings(formData);
        toast.success("Configurações salvas com sucesso!");
      } catch {
        // Removemos a variável 'error' para não dar aviso de "não usada"
        toast.error("Erro ao salvar configurações.");
      }
    });
  };

 return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Configurações</h1>
          <p className="text-slate-500 text-sm">Gerencie os parâmetros globais da escola.</p>
        </div>
        
        <button 
          form="settings-form"
          disabled={isPending}
          className="flex items-center gap-2 bg-[#7c3aed] text-white px-6 py-2.5 rounded-lg hover:bg-[#6d28d9] transition-colors font-medium disabled:opacity-70"
        >
          {isPending ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          Salvar Alterações
        </button>
      </div>

      <div className="flex gap-2 border-b border-slate-200">
        <TabButton 
          isActive={activeTab === "perfil"} 
          onClick={() => setActiveTab("perfil")} 
          icon={<School size={18} />} 
          label="Perfil da Escola" 
        />
        <TabButton 
          isActive={activeTab === "academico"} 
          onClick={() => setActiveTab("academico")} 
          icon={<GraduationCap size={18} />} 
          label="Acadêmico" 
        />
        <TabButton 
          isActive={activeTab === "sistema"} 
          onClick={() => setActiveTab("sistema")} 
          icon={<SettingsIcon size={18} />} 
          label="Sistema" 
        />
      </div>

      <form id="settings-form" action={handleSubmit} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 min-h-[400px]">
        
        {/* === ABA 1: PERFIL (Usando CSS para esconder/mostrar) === */}
        <div className={activeTab === "perfil" ? "block space-y-6 animate-in fade-in" : "hidden"}>
            <div className="flex gap-6 items-start">
              <div className="w-40 shrink-0">
                <label className="block text-xs font-bold text-slate-600 mb-2">Logo da Instituição</label>
                <input 
                  type="file" 
                  name="logoFile" 
                  hidden 
                  ref={fileInputRef} 
                  onChange={handleFileSelect} 
                  accept="image/*"
                />
                <input type="hidden" name="schoolLogo" value={data.schoolLogo || ""} />
                
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-40 h-40 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 cursor-pointer flex flex-col items-center justify-center gap-2 text-slate-500 overflow-hidden relative group"
                >
                  {logoPreview ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={logoPreview} className="w-full h-full object-contain p-2" alt="Logo" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-medium">
                        Alterar
                      </div>
                    </>
                  ) : (
                    <>
                      <Upload size={24} />
                      <span className="text-xs">Enviar Logo</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <InputGroup label="Nome da Escola" name="schoolName" defaultValue={data.schoolName} required />
                <div className="grid grid-cols-2 gap-4">
                  <InputGroup label="CNPJ" name="cnpj" defaultValue={data.cnpj || ""} placeholder="00.000.000/0001-00" />
                  <InputGroup label="Telefone / WhatsApp" name="phone" defaultValue={data.phone || ""} />
                </div>
                <InputGroup label="Endereço Completo" name="address" defaultValue={data.address || ""} />
              </div>
            </div>
        </div>

        {/* === ABA 2: ACADÊMICO === */}
        <div className={activeTab === "academico" ? "grid grid-cols-2 gap-6 animate-in fade-in" : "hidden"}>
             <div className="col-span-2 p-4 bg-blue-50 text-blue-800 rounded-lg text-sm mb-2 border border-blue-100">
                ⚠️ <strong>Atenção:</strong> Alterar a média ou periodicidade no meio do ano letivo pode afetar o cálculo de notas já lançadas.
             </div>

             <InputGroup label="Ano Letivo Atual" name="currentYear" defaultValue={data.currentYear} type="number" />
             
             <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Periodicidade</label>
                <select 
                  name="periodicity" 
                  defaultValue={data.periodicity}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#7c3aed] bg-white h-[38px]"
                >
                  <option value="BIMESTRAL">Bimestral (4 Etapas)</option>
                  <option value="TRIMESTRAL">Trimestral (3 Etapas)</option>
                  <option value="SEMESTRAL">Semestral (2 Etapas)</option>
                </select>
             </div>

             <InputGroup label="Média para Aprovação (0-10)" name="passingGrade" defaultValue={data.passingGrade} type="number" step="0.1" />
             <InputGroup label="Frequência Mínima (%)" name="minFrequency" defaultValue={data.minFrequency} type="number" />
        </div>

        {/* === ABA 3: SISTEMA === */}
        <div className={activeTab === "sistema" ? "block space-y-6 animate-in fade-in" : "hidden"}>
             <ToggleItem 
                name="isGradesVisible" 
                defaultChecked={data.isGradesVisible}
                title="Liberar Visualização de Notas"
                description="Se ativado, pais e alunos poderão ver o boletim e as notas lançadas. Desative durante conselhos de classe."
             />
             <div className="h-px bg-slate-100" />
             <ToggleItem 
                name="isMaintenance" 
                defaultChecked={data.isMaintenance}
                title="Modo Manutenção (Bloqueio de Acesso)"
                description="Se ativado, APENAS administradores e professores conseguirão entrar no sistema. Pais verão uma mensagem de aviso."
                danger
             />
        </div>
      </form>
    </div>
  );
}

// Componentes Auxiliares com Tipagem Correta

function TabButton({ isActive, onClick, icon, label }: TabButtonProps) {
  return (
    <button 
      type="button" // Importante para não submeter o form ao clicar na aba
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
        isActive 
        ? "border-[#7c3aed] text-[#7c3aed]" 
        : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
      }`}
    >
      {icon} {label}
    </button>
  );
}

function InputGroup({ label, ...props }: InputGroupProps) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-bold text-slate-600">{label}</label>
      <input 
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#7c3aed]"
        {...props}
      />
    </div>
  );
}

function ToggleItem({ title, description, name, defaultChecked, danger }: ToggleItemProps) {
  return (
    <div className="flex items-start gap-3">
       <div className="pt-1">
         <input type="checkbox" name={name} defaultChecked={defaultChecked} className="w-5 h-5 accent-[#7c3aed]" />
       </div>
       <div>
         <h3 className={`text-sm font-bold ${danger ? 'text-red-600' : 'text-slate-800'}`}>{title}</h3>
         <p className="text-sm text-slate-500 mt-1">{description}</p>
       </div>
    </div>
  );
}