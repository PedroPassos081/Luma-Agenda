"use client";

import { useState, useTransition, ChangeEvent, useRef } from "react";
import { createAnnouncement, deleteAnnouncement } from "./_actions/createAnnouncement";
import { toast } from "sonner";
import { Modal } from "../../../components/Modal/Modal"; 
import { Megaphone, Plus, Trash2, Calendar, Image as ImageIcon, UploadCloud, X, Maximize2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type Announcement = {
  id: string;
  title: string;
  content: string;
  imageUrl: string | null;
  createdAt: Date;
};

export default function AnnouncementsClient({ data }: { data: Announcement[] }) {
  // Estados de CRIAÇÃO
  const [createOpen, setCreateOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados de VISUALIZAÇÃO (O "Ver Mais")
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Announcement | null>(null);

  // --- Funções de Upload ---
  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
    }
  };

  const clearImage = () => {
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const handleCloseCreate = () => {
      setCreateOpen(false);
      clearImage();
  }

  // --- Função de Visualizar ---
  const handleView = (item: Announcement) => {
      setSelectedItem(item);
      setViewOpen(true);
  }

  // --- Funções de Ação ---
  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createAnnouncement(formData);
      if (result?.error) {
          toast.error(result.error);
      } else {
          handleCloseCreate();
          toast.success("Informativo publicado!");
      }
    });
  }

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Evita abrir o modal de visualização ao clicar em apagar
    if(!confirm("Deseja realmente apagar este aviso?")) return;
    startTransition(async () => await deleteAnnouncement(id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Mural de Avisos</h1>
          <p className="text-slate-500 text-sm">Publique eventos e comunicados para os pais.</p>
        </div>
        <button 
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 bg-[#7c3aed] text-white px-4 py-2 rounded-lg hover:bg-[#6d28d9] transition-colors font-medium text-sm"
        >
          <Plus size={18} /> Novo Aviso
        </button>
      </div>

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.length === 0 && (
          <div className="col-span-full py-20 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
            <Megaphone className="mx-auto mb-3 opacity-20" size={48} />
            <p>Nenhum comunicado publicado ainda.</p>
          </div>
        )}

        {data.map((item) => (
          <article 
            key={item.id} 
            onClick={() => handleView(item)} // Clicar no card abre a visualização
            className="group bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-all flex flex-col cursor-pointer relative"
          >
            {/* Imagem de Capa (Mantemos cropada aqui para o grid ficar bonito) */}
            <div className="h-48 w-full bg-slate-100 relative overflow-hidden">
              {item.imageUrl ? (
                <>
                    <img 
                    src={item.imageUrl} 
                    alt={item.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    {/* Overlay para indicar clique */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <span className="bg-white/90 text-slate-700 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-2">
                            <Maximize2 size={14} /> Ver completo
                        </span>
                    </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                  <ImageIcon size={32} />
                </div>
              )}
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded-md text-xs font-bold text-slate-700 flex items-center gap-1 shadow-sm z-10">
                <Calendar size={12} />
                {format(item.createdAt, "dd 'de' MMM", { locale: ptBR })}
              </div>
            </div>

            {/* Resumo do Conteúdo */}
            <div className="p-5 flex flex-col flex-1">
              <h3 className="font-bold text-slate-800 mb-2 line-clamp-1 group-hover:text-[#7c3aed] transition-colors">
                  {item.title}
              </h3>
              <p className="text-sm text-slate-500 line-clamp-3 mb-4 flex-1">
                {item.content}
              </p>
              
              <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
                <span className="text-xs font-medium text-[#7c3aed] flex items-center gap-1">
                    Ler mais
                </span>
                <button 
                  onClick={(e) => handleDelete(item.id, e)}
                  className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1 bg-red-50 px-2 py-1 rounded hover:bg-red-100 transition-colors z-20 relative"
                >
                  <Trash2 size={14} /> Apagar
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* 1. MODAL DE CRIAÇÃO (Novo Aviso) */}
      <Modal open={createOpen} onClose={handleCloseCreate}>
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Megaphone className="text-[#7c3aed]" size={20} />
          Novo Comunicado
        </h2>
        
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">Título do Aviso</label>
            <input 
              name="title"
              required 
              placeholder="Ex: Festa Junina 2025"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#7c3aed]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">Imagem de Capa</label>
            <input 
                type="file"
                name="imageFile" 
                accept="image/*"
                hidden
                ref={fileInputRef}
                onChange={handleFileSelect}
            />
            {!previewUrl ? (
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-32 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 cursor-pointer flex flex-col items-center justify-center gap-2 text-slate-500"
                >
                    <UploadCloud size={24} />
                    <p className="text-xs">Clique para selecionar uma imagem</p>
                </div>
            ) : (
                <div className="relative w-full h-48 rounded-lg overflow-hidden border border-slate-200 group">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={clearImage} className="absolute top-2 right-2 bg-white p-1 rounded-full text-slate-600 shadow-sm">
                        <X size={16} />
                    </button>
                </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">Mensagem</label>
            <textarea 
              name="content"
              required 
              rows={4}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#7c3aed] resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full mt-2 rounded-lg bg-[#7c3aed] py-2.5 text-sm font-medium text-white hover:bg-[#6d28d9] disabled:opacity-70"
          >
            {isPending ? "Publicando..." : "Publicar Aviso"}
          </button>
        </form>
      </Modal>

      {/* 2. MODAL DE VISUALIZAÇÃO (Ver Detalhes) */}
      <Modal open={viewOpen} onClose={() => setViewOpen(false)}>
        {selectedItem && (
            <div className="space-y-5">
                {/* Imagem Inteira (Sem cortes) */}
                {selectedItem.imageUrl && (
                    <div className="w-full rounded-xl overflow-hidden bg-slate-50 border border-slate-100">
                        {/* object-contain faz a imagem aparecer inteira, ajustando-se ao tamanho */}
                        <img 
                            src={selectedItem.imageUrl} 
                            alt={selectedItem.title} 
                            className="w-full h-auto max-h-[60vh] object-contain mx-auto" 
                        />
                    </div>
                )}

                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold text-[#7c3aed] bg-purple-50 px-2 py-1 rounded-md border border-purple-100">
                            Comunicado
                        </span>
                        <span className="text-xs text-slate-400">
                             {format(selectedItem.createdAt, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </span>
                    </div>
                    
                    <h2 className="text-xl font-bold text-slate-900 leading-tight mb-3">
                        {selectedItem.title}
                    </h2>
                    
                    {/* Texto completo com scroll se necessário */}
                    <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap max-h-[30vh] overflow-y-auto pr-2">
                        {selectedItem.content}
                    </div>
                </div>

                <button 
                    onClick={() => setViewOpen(false)}
                    className="w-full py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50"
                >
                    Fechar
                </button>
            </div>
        )}
      </Modal>

    </div>
  );
}