import React from 'react';
import {
  Search,
  Paperclip,
  Star,
  Pin,
  Trash2,
  Archive,
  Mail,
  MailOpen,
  Clock,
  Filter,
  RefreshCw,
  CheckSquare,
  Square,
  SlidersHorizontal
} from 'lucide-react';
import { EmailThread, Account, EmailTag } from '../types/mail';

interface EmailListProps {
  threads: EmailThread[];
  selectedThreadId: string | null;
  onSelectThread: (threadId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterOnlyUnread: boolean;
  onToggleFilterUnread: () => void;
  filterOnlyAttachments: boolean;
  onToggleFilterAttachments: () => void;
  accounts: Account[];
  tags: EmailTag[];
  onToggleStar: (threadId: string, e: React.MouseEvent) => void;
  onTogglePin: (threadId: string, e: React.MouseEvent) => void;
  onToggleRead: (threadId: string, e: React.MouseEvent) => void;
  onArchive: (threadId: string, e: React.MouseEvent) => void;
  onTrash: (threadId: string, e: React.MouseEvent) => void;
  onSnoozeClick: (threadId: string, e: React.MouseEvent) => void;
  selectedThreadIds: string[];
  onToggleSelectThread: (threadId: string, e: React.MouseEvent) => void;
  onSelectAll: () => void;
  onRefresh: () => void;
  onOpenMessageFilters: () => void;
}

export const EmailList: React.FC<EmailListProps> = ({
  threads,
  selectedThreadId,
  onSelectThread,
  searchQuery,
  onSearchChange,
  filterOnlyUnread,
  onToggleFilterUnread,
  filterOnlyAttachments,
  onToggleFilterAttachments,
  accounts,
  tags,
  onToggleStar,
  onTogglePin,
  onToggleRead,
  onArchive,
  onTrash,
  onSnoozeClick,
  selectedThreadIds,
  onToggleSelectThread,
  onSelectAll,
  onRefresh,
  onOpenMessageFilters,
}) => {
  const accountMap = new Map<string, Account>(accounts.map(a => [a.id, a]));
  const tagMap = new Map<string, EmailTag>(tags.map(t => [t.id, t]));

  const allSelected = threads.length > 0 && selectedThreadIds.length === threads.length;

  return (
    <div className="w-80 md:w-96 flex-shrink-0 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full select-none">
      {/* Top Search Bar with quick filter toggles */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-800 space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Pesquisar e-mails (ou pressione /)..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-900 border border-transparent dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
          />
        </div>

        {/* Quick Filter Buttons (Mailbird-style filter chips) */}
        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={onToggleFilterUnread}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              filterOnlyUnread
                ? 'bg-sky-500 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Não Lidos
          </button>
          <button
            onClick={onToggleFilterAttachments}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1 ${
              filterOnlyAttachments
                ? 'bg-sky-500 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Paperclip className="w-3 h-3" />
            Com Anexos
          </button>
          <div className="flex-1" />
          <button
            onClick={onOpenMessageFilters}
            title="Filtros de Mensagens & Automações (estilo Thunderbird)"
            className="p-1 rounded text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/60 transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRefresh}
            title="Sincronizar e-mails"
            className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Subheader: Selection & Counter */}
      <div className="px-3 py-1.5 bg-slate-50/60 dark:bg-slate-900/50 border-b border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <button
          onClick={onSelectAll}
          className="flex items-center gap-1.5 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          {allSelected ? (
            <CheckSquare className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
          ) : (
            <Square className="w-3.5 h-3.5" />
          )}
          <span>{selectedThreadIds.length > 0 ? `${selectedThreadIds.length} selecionados` : 'Selecionar tudo'}</span>
        </button>
        <span className="tabular-nums font-mono text-[11px]">
          {threads.length} {threads.length === 1 ? 'mensagem' : 'mensagens'}
        </span>
      </div>

      {/* Threads List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-900">
        {threads.length === 0 ? (
          <div className="p-8 text-center text-slate-400 dark:text-slate-600 space-y-2">
            <Mail className="w-8 h-8 mx-auto stroke-1" />
            <p className="text-xs">Nenhum e-mail encontrado nesta pasta ou filtro.</p>
          </div>
        ) : (
          threads.map((thread) => {
            const isSelected = selectedThreadId === thread.id;
            const isChecked = selectedThreadIds.includes(thread.id);
            const account = accountMap.get(thread.accountId);
            const firstParticipant = thread.participants[0];

            return (
              <div
                key={thread.id}
                onClick={() => onSelectThread(thread.id)}
                className={`group relative p-3 cursor-pointer transition-colors border-l-4 ${
                  isSelected
                    ? 'bg-sky-50 dark:bg-slate-900 border-l-sky-500'
                    : thread.isPinned
                    ? 'bg-amber-50/30 dark:bg-amber-950/10 border-l-amber-400'
                    : 'hover:bg-slate-50/80 dark:hover:bg-slate-900/60 border-l-transparent'
                }`}
              >
                {/* Account visual indicator strip */}
                {account && (
                  <span
                    className="absolute top-3 right-3 w-2 h-2 rounded-full"
                    style={{ backgroundColor: account.color }}
                    title={`Conta: ${account.name}`}
                  />
                )}

                {/* Sender Header row */}
                <div className="flex items-center gap-2 mb-1 pr-4">
                  {/* Checkbox for batch actions */}
                  <button
                    onClick={(e) => onToggleSelectThread(thread.id, e)}
                    className="text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 flex-shrink-0"
                  >
                    {isChecked ? (
                      <CheckSquare className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                    ) : (
                      <Square className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </button>

                  {/* Sender Name */}
                  <span
                    className={`text-xs truncate flex-1 ${
                      !thread.isRead
                        ? 'font-bold text-slate-900 dark:text-white'
                        : 'font-medium text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {firstParticipant ? firstParticipant.name : 'Desconhecido'}
                    {thread.messageCount > 1 && (
                      <span className="ml-1 text-[11px] text-slate-400 font-normal">
                        ({thread.messageCount})
                      </span>
                    )}
                  </span>

                  {/* Timestamp */}
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 tabular-nums flex-shrink-0">
                    {thread.lastMessageDate}
                  </span>
                </div>

                {/* Subject line */}
                <h4
                  className={`text-xs truncate mb-1 ${
                    !thread.isRead
                      ? 'font-semibold text-slate-900 dark:text-slate-100'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {thread.subject || '(Sem assunto)'}
                </h4>

                {/* Snippet */}
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mb-1.5 font-normal">
                  {thread.snippet}
                </p>

                {/* Bottom Row: Tags & Icons */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* Star toggle */}
                  <button
                    onClick={(e) => onToggleStar(thread.id, e)}
                    className={`p-0.5 rounded transition-colors ${
                      thread.isStarred ? 'text-amber-400' : 'text-slate-300 hover:text-slate-400 dark:text-slate-700'
                    }`}
                    title={thread.isStarred ? 'Remover estrela' : 'Adicionar aos favoritos'}
                  >
                    <Star className="w-3 h-3 fill-current" />
                  </button>

                  {/* Attachments Icon */}
                  {thread.hasAttachments && (
                    <span title="Contém anexo" className="flex items-center">
                      <Paperclip className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                    </span>
                  )}

                  {/* Snoozed Indicator */}
                  {thread.isSnoozed && (
                    <span className="flex items-center gap-0.5 text-[10px] text-indigo-500 dark:text-indigo-400 font-medium">
                      <Clock className="w-3 h-3" />
                      Adiado
                    </span>
                  )}

                  {/* Pin Indicator */}
                  {thread.isPinned && (
                    <span title="Fixado no topo" className="flex items-center">
                      <Pin className="w-3 h-3 text-amber-500 fill-current" />
                    </span>
                  )}

                  {/* Tags */}
                  {thread.tags.map((tagId) => {
                    const tag = tagMap.get(tagId);
                    if (!tag) return null;
                    return (
                      <span
                        key={tag.id}
                        className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${tag.badgeBg} ${tag.badgeText}`}
                      >
                        {tag.name}
                      </span>
                    );
                  })}
                </div>

                {/* Mailbird Hover Quick Actions (Slide-in bar on hover) */}
                <div className="absolute right-2 top-2 hidden group-hover:flex items-center gap-1 bg-white/95 dark:bg-slate-900/95 shadow-md px-1.5 py-1 rounded-md border border-slate-200 dark:border-slate-800 z-10 transition-all">
                  <button
                    onClick={(e) => onToggleRead(thread.id, e)}
                    title={thread.isRead ? 'Marcar como não lido' : 'Marcar como lido'}
                    className="p-1 rounded text-slate-500 hover:text-sky-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    {thread.isRead ? <Mail className="w-3.5 h-3.5" /> : <MailOpen className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={(e) => onSnoozeClick(thread.id, e)}
                    title="Adiar (Snooze)"
                    className="p-1 rounded text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Clock className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => onTogglePin(thread.id, e)}
                    title={thread.isPinned ? 'Desafixar' : 'Fixar no topo'}
                    className="p-1 rounded text-slate-500 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Pin className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => onArchive(thread.id, e)}
                    title="Arquivar"
                    className="p-1 rounded text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Archive className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => onTrash(thread.id, e)}
                    title="Excluir"
                    className="p-1 rounded text-slate-500 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
