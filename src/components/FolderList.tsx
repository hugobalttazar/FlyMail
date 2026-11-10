import React from 'react';
import {
  Inbox,
  Star,
  Clock,
  Send,
  FileText,
  Archive,
  Trash2,
  AlertTriangle,
  Plus,
  Tag as TagIcon,
  Edit3
} from 'lucide-react';
import { Account, EmailTag } from '../types/mail';

interface FolderListProps {
  selectedFolder: string;
  onSelectFolder: (folderId: string) => void;
  selectedTagId: string | null;
  onSelectTag: (tagId: string | null) => void;
  tags: EmailTag[];
  activeAccount: Account | null; // null for unified
  unreadCounts: Record<string, number>;
  onOpenCompose: () => void;
  onCreateTagPrompt: () => void;
}

export const FolderList: React.FC<FolderListProps> = ({
  selectedFolder,
  onSelectFolder,
  selectedTagId,
  onSelectTag,
  tags,
  activeAccount,
  unreadCounts,
  onOpenCompose,
  onCreateTagPrompt,
}) => {
  const folders = [
    { id: 'inbox', label: 'Caixa de Entrada', icon: Inbox, countKey: 'inbox' },
    { id: 'starred', label: 'Com Estrela', icon: Star, countKey: 'starred' },
    { id: 'snoozed', label: 'Adiados (Snooze)', icon: Clock, countKey: 'snoozed' },
    { id: 'sent', label: 'Enviados', icon: Send, countKey: 'sent' },
    { id: 'drafts', label: 'Rascunhos', icon: FileText, countKey: 'drafts' },
    { id: 'archive', label: 'Arquivados', icon: Archive, countKey: 'archive' },
    { id: 'trash', label: 'Lixeira', icon: Trash2, countKey: 'trash' },
    { id: 'spam', label: 'Spam', icon: AlertTriangle, countKey: 'spam' },
  ];

  return (
    <div className="w-56 flex-shrink-0 bg-slate-100/90 dark:bg-slate-900/90 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full select-none">
      {/* Header with Account Title & Compose Button */}
      <div className="p-3 border-b border-slate-200/70 dark:border-slate-800">
        <button
          onClick={onOpenCompose}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-medium text-sm rounded-lg shadow-sm shadow-sky-600/20 transition-all hover:shadow"
        >
          <Edit3 className="w-4 h-4" />
          <span>Escrever</span>
        </button>
      </div>

      {/* Account Info Pill */}
      <div className="px-3.5 py-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <span 
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: activeAccount ? activeAccount.color : '#0284C7' }}
        />
        <span className="truncate font-medium">
          {activeAccount ? activeAccount.name : 'Caixa Unificada (Todas)'}
        </span>
      </div>

      {/* Folders List */}
      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
        {folders.map((folder) => {
          const Icon = folder.icon;
          const isSelected = selectedFolder === folder.id && selectedTagId === null;
          const count = unreadCounts[folder.countKey] || 0;

          return (
            <button
              key={folder.id}
              onClick={() => {
                onSelectTag(null);
                onSelectFolder(folder.id);
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                isSelected
                  ? 'bg-sky-500/10 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400'}`} />
                <span className="truncate">{folder.label}</span>
              </div>
              {count > 0 && (
                <span className={`text-[11px] tabular-nums font-semibold px-1.5 py-0.2 rounded ${
                  isSelected 
                    ? 'bg-sky-600 text-white dark:bg-sky-500' 
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}

        {/* Separator for Tags/Labels */}
        <div className="pt-4 pb-1.5 px-2 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Marcadores
          </span>
          <button
            onClick={onCreateTagPrompt}
            title="Criar novo marcador"
            className="p-0.5 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Tag List */}
        <div className="space-y-0.5">
          {tags.map((tag) => {
            const isSelected = selectedTagId === tag.id;
            const count = unreadCounts[`tag_${tag.id}`] || 0;

            return (
              <button
                key={tag.id}
                onClick={() => {
                  onSelectTag(tag.id);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  isSelected
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: tag.color }}
                  />
                  <span className="truncate">{tag.name}</span>
                </div>
                {count > 0 && (
                  <span className="text-[10px] tabular-nums font-semibold px-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
