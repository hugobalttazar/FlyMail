import React, { useState } from 'react';
import {
  FileText,
  Plus,
  ExternalLink,
  Sparkles,
  BookOpen,
  FolderOpen,
  Edit3,
  CheckCircle2
} from 'lucide-react';
import { createGoogleDoc } from '../utils/googleWorkspaceApi';

export const DocsView: React.FC = () => {
  const [docTitle, setDocTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createdDocs, setCreatedDocs] = useState<{ id: string; title: string; link: string; date: string }[]>(() => {
    const saved = localStorage.getItem('flymail_recent_docs');
    return saved ? JSON.parse(saved) : [];
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim()) return;
    setIsCreating(true);

    const title = docTitle.trim();
    const result = await createGoogleDoc(title);
    setIsCreating(false);

    if (result?.webViewLink) {
      const newEntry = {
        id: result.id,
        title,
        link: result.webViewLink,
        date: new Date().toLocaleDateString('pt-BR'),
      };
      const updated = [newEntry, ...createdDocs];
      setCreatedDocs(updated);
      localStorage.setItem('flymail_recent_docs', JSON.stringify(updated));
      setDocTitle('');
      window.open(result.webViewLink, '_blank');
    } else {
      // Fallback para abrir o criador oficial do Google Docs
      window.open(`https://docs.google.com/document/create?title=${encodeURIComponent(title)}`, '_blank');
    }
  };

  const templates = [
    { title: 'Documento em Branco', desc: 'Iniciar uma folha limpa no Google Docs', icon: '📄' },
    { title: 'Relatório Executivo', desc: 'Estrutura formal para relatórios corporativos', icon: '📊' },
    { title: 'Minuta de Contrato', desc: 'Padrão com cláusulas, foro e assinaturas', icon: '📜' },
    { title: 'Pauta de Reunião', desc: 'Objetivos, participantes e lista de ações', icon: '📝' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-y-auto p-6 select-none">
      {/* Header */}
      <div className="max-w-4xl mx-auto w-full mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Google Docs</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 font-bold border border-blue-500/20">
                Workspace
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Crie, edite e colabore em documentos de texto diretamente na nuvem do Google.
            </p>
          </div>
        </div>
      </div>

      {/* Main Creation Card */}
      <div className="max-w-4xl mx-auto w-full space-y-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-blue-500" />
            <span>Criar Novo Documento</span>
          </h2>
          <p className="text-xs text-slate-400 mb-4">
            Digite o nome do documento. Ao avançar, o arquivo é gerado no seu Google Drive e aberto para edição em tempo real.
          </p>

          <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              placeholder="Ex: Proposta Comercial FlyMail 2026"
              className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              required
            />
            <button
              type="submit"
              disabled={isCreating || !docTitle.trim()}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isCreating ? 'Criando no Google...' : 'Criar Documento'}</span>
            </button>
          </form>
        </div>

        {/* Templates Quick Start */}
        <div>
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
            Modelos Rápidos do Google Docs
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {templates.map((tpl, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  window.open('https://docs.google.com/document/u/0/create', '_blank');
                }}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-blue-500/50 hover:bg-blue-50/10 text-left transition-all group cursor-pointer"
              >
                <div className="text-2xl mb-2">{tpl.icon}</div>
                <div className="font-bold text-xs text-slate-800 dark:text-slate-200 group-hover:text-blue-500 transition-colors">
                  {tpl.title}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  {tpl.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Created Docs */}
        {createdDocs.length > 0 && (
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Documentos Criados Recentemente</span>
              <span className="text-[10px] text-slate-400 font-mono">{createdDocs.length} itens</span>
            </h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {createdDocs.map((doc) => (
                <div key={doc.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {doc.title}
                      </div>
                      <div className="text-[10px] text-slate-400">Criado em {doc.date}</div>
                    </div>
                  </div>
                  <a
                    href={doc.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <span>Editar no Google Docs</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
