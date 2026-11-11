import React, { useState, useEffect } from 'react';
import {
  Folder,
  FileText,
  Trash2,
  ExternalLink,
  Plus,
  RefreshCw,
  Search,
  HardDrive,
  FileSpreadsheet,
  FileImage,
  FileCode,
  File,
  Download,
  AlertCircle
} from 'lucide-react';
import { DriveFile } from '../types/mail';
import { fetchDriveFiles, deleteDriveFile, createGoogleDoc } from '../utils/googleWorkspaceApi';

interface DriveViewProps {
  onOpenDoc: (docUrl: string) => void;
}

export const DriveView: React.FC<DriveViewProps> = ({ onOpenDoc }) => {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatingDoc, setIsCreatingDoc] = useState(false);
  const [newDocName, setNewDocName] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);

  const loadFiles = async () => {
    setIsLoading(true);
    try {
      const driveItems = await fetchDriveFiles();
      setFiles(driveItems);
    } catch (err) {
      console.error('Falha ao carregar arquivos do Drive:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const handleCreateNewDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName.trim()) return;
    setIsCreatingDoc(true);
    const created = await createGoogleDoc(newDocName.trim());
    setIsCreatingDoc(false);
    setShowCreateModal(false);
    setNewDocName('');

    if (created?.webViewLink) {
      window.open(created.webViewLink, '_blank');
      loadFiles();
    }
  };

  const handleDelete = async (file: DriveFile) => {
    // Mandatório pela política de segurança da Workspace API: diálogo explícito com nome do arquivo
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir o arquivo "${file.name}" do seu Google Drive? Esta ação enviará o item para a lixeira do Drive.`
    );
    if (!confirmed) return;

    const ok = await deleteDriveFile(file.id);
    if (ok) {
      setFiles(prev => prev.filter(f => f.id !== file.id));
    } else {
      alert('Não foi possível excluir o arquivo. Verifique sua conexão e permissões do Google Drive.');
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('document') || mimeType.includes('text')) {
      return <FileText className="w-5 h-5 text-blue-500" />;
    }
    if (mimeType.includes('spreadsheet') || mimeType.includes('sheet')) {
      return <FileSpreadsheet className="w-5 h-5 text-emerald-500" />;
    }
    if (mimeType.includes('image')) {
      return <FileImage className="w-5 h-5 text-purple-500" />;
    }
    if (mimeType.includes('folder')) {
      return <Folder className="w-5 h-5 text-amber-500 fill-amber-500/20" />;
    }
    return <File className="w-5 h-5 text-slate-400" />;
  };

  const filteredFiles = files.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-hidden select-none">
      {/* Header */}
      <div className="h-16 px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-emerald-500 flex items-center justify-center text-white shadow-xs">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Google Drive</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20">
                Sincronizado
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Acesse, visualize, edite e organize seus documentos e arquivos da nuvem.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadFiles}
            disabled={isLoading}
            title="Atualizar lista de arquivos"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-sky-500' : ''}`} />
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Documento</span>
          </button>
        </div>
      </div>

      {/* Search Bar & Stats */}
      <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 flex items-center justify-between">
        <div className="relative w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar arquivos no Drive..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>

        <div className="text-xs text-slate-400 font-mono">
          {filteredFiles.length} arquivos disponíveis
        </div>
      </div>

      {/* Main Files Table / Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {isLoading && files.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-sky-500" />
            <span className="text-xs">Consultando arquivos do Google Drive...</span>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <HardDrive className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-2" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
              Nenhum arquivo encontrado
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mb-4">
              Crie seu primeiro documento Google Docs pelo botão acima ou verifique os arquivos da sua conta.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              Criar Documento Agora
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 hover:border-sky-500/50 hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                    {getFileIcon(file.mimeType)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4
                      title={file.name}
                      className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-sky-500 transition-colors"
                    >
                      {file.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                      {file.modifiedTime ? new Date(file.modifiedTime).toLocaleDateString('pt-BR') : 'Google Workspace'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <a
                    href={file.webViewLink || `https://drive.google.com/file/d/${file.id}/view`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-600 dark:text-sky-400 hover:underline"
                  >
                    <span>Abrir / Editar</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <button
                    onClick={() => handleDelete(file)}
                    title="Excluir arquivo do Google Drive"
                    className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Criar Documento Google Docs */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-900 dark:text-slate-100">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-blue-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Criar Novo Google Docs
              </h3>
            </div>
            <form onSubmit={handleCreateNewDoc} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Título do Documento:
                </label>
                <input
                  type="text"
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  placeholder="Ex: Relatório Semanal de Projetos"
                  autoFocus
                  required
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreatingDoc || !newDocName.trim()}
                  className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold shadow-xs disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {isCreatingDoc && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Criar no Google Drive</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
