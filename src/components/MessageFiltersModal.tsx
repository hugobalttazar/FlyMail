import React, { useState } from 'react';
import {
  X,
  Plus,
  Play,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  CheckCircle,
  SlidersHorizontal,
  FolderDown,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import { MessageFilter, Account, EmailTag } from '../types/mail';

interface MessageFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: MessageFilter[];
  accounts: Account[];
  tags: EmailTag[];
  onToggleFilter: (filterId: string) => void;
  onDeleteFilter: (filterId: string) => void;
  onMoveFilterUp: (index: number) => void;
  onMoveFilterDown: (index: number) => void;
  onOpenCreateFilter: () => void;
  onOpenEditFilter: (filter: MessageFilter) => void;
  onRunFiltersNow: (targetFolderId: string) => { matchedCount: number; reportMessages: string[] };
}

export const MessageFiltersModal: React.FC<MessageFiltersModalProps> = ({
  isOpen,
  onClose,
  filters,
  accounts,
  tags,
  onToggleFilter,
  onDeleteFilter,
  onMoveFilterUp,
  onMoveFilterDown,
  onOpenCreateFilter,
  onOpenEditFilter,
  onRunFiltersNow,
}) => {
  const [selectedFilterId, setSelectedFilterId] = useState<string | null>(filters[0]?.id || null);
  const [accountFilter, setAccountFilter] = useState<string>('all');
  const [targetFolderForRun, setTargetFolderForRun] = useState<string>('inbox');
  const [runResult, setRunResult] = useState<{ count: number; messages: string[] } | null>(null);

  if (!isOpen) return null;

  const tagMap = new Map(tags.map(t => [t.id, t.name]));

  const filteredList = filters.filter(f => {
    if (accountFilter === 'all') return true;
    return f.accountId === accountFilter || f.accountId === null;
  });

  const selectedIndex = filteredList.findIndex(f => f.id === selectedFilterId);
  const selectedFilter = filteredList[selectedIndex];

  const handleRunNow = () => {
    const res = onRunFiltersNow(targetFolderForRun);
    setRunResult({ count: res.matchedCount, messages: res.reportMessages });
    setTimeout(() => {
      setRunResult(null);
    }, 6000);
  };

  const folders = [
    { id: 'inbox', label: 'Caixa de Entrada' },
    { id: 'all', label: 'Todas as Pastas' },
    { id: 'archive', label: 'Arquivados' },
    { id: 'trash', label: 'Lixeira' },
    { id: 'spam', label: 'Spam' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 animate-in fade-in duration-150 select-none">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl text-slate-900 dark:text-slate-100 flex flex-col h-[620px] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-xs">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Filtros de Mensagens & Automações
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Regras automatizadas inspiradas no Mozilla Thunderbird para classificar e organizar e-mails
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter for Accounts Toolbar */}
        <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/30 dark:bg-slate-950/20 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600 dark:text-slate-400">
              Filtros para:
            </span>
            <select
              value={accountFilter}
              onChange={(e) => setAccountFilter(e.target.value)}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:border-sky-500"
            >
              <option value="all">Todas as Contas (Caixa Unificada)</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.email})
                </option>
              ))}
            </select>
          </div>

          <div className="text-[11px] text-slate-400">
            {filteredList.filter(f => f.enabled).length} de {filteredList.length} filtros ativos
          </div>
        </div>

        {/* Main Body: Rules List + Actions Control Sidebar */}
        <div className="flex-1 flex overflow-hidden">
          {/* Rules List Container */}
          <div className="flex-1 p-4 overflow-y-auto">
            {filteredList.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                <SlidersHorizontal className="w-10 h-10 stroke-1 mb-2 text-slate-300 dark:text-slate-700" />
                <p className="text-xs font-semibold">Nenhuma regra de filtro cadastrada.</p>
                <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
                  Clique em &quot;Novo Filtro...&quot; para criar sua primeira automação estilo Thunderbird.
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                {filteredList.map((filter, index) => {
                  const isSelected = selectedFilterId === filter.id;

                  return (
                    <div
                      key={filter.id}
                      onClick={() => setSelectedFilterId(filter.id)}
                      className={`p-3.5 flex items-start justify-between gap-3 cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-sky-50/60 dark:bg-sky-950/30 border-l-4 border-l-sky-500'
                          : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40 border-l-4 border-l-transparent'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        {/* Checkbox Toggle Enabled */}
                        <input
                          type="checkbox"
                          checked={filter.enabled}
                          onChange={(e) => {
                            e.stopPropagation();
                            onToggleFilter(filter.id);
                          }}
                          className="mt-1 w-4 h-4 rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
                          title={filter.enabled ? 'Filtro ativado' : 'Filtro desativado'}
                        />

                        {/* Filter Details */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                              {filter.name}
                            </span>
                            {!filter.enabled && (
                              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-500">
                                Desativado
                              </span>
                            )}
                          </div>

                          {/* Conditions snippet */}
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                            Critério ({filter.matchMode === 'all' ? 'E / AND' : 'OU / OR'}):{' '}
                            {filter.conditions.map(c => `${c.field} ${c.operator} "${c.value}"`).join('; ')}
                          </div>

                          {/* Actions snippet */}
                          <div className="text-[11px] text-sky-600 dark:text-sky-400 font-medium mt-0.5 truncate">
                            Ações:{' '}
                            {filter.actions.map(a => {
                              if (a.type === 'moveToFolder') return `Mover para ${a.targetFolderId}`;
                              if (a.type === 'applyTag') return `Aplicar marcador ${tagMap.get(a.targetTagId || '') || a.targetTagId}`;
                              if (a.type === 'markAsRead') return 'Marcar como lido';
                              if (a.type === 'markAsStarred') return 'Marcar com estrela';
                              if (a.type === 'markAsPinned') return 'Fixar no topo';
                              if (a.type === 'delete') return 'Excluir';
                              return a.type;
                            }).join(', ')}
                          </div>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono text-slate-400 flex-shrink-0">
                        Ordem: #{index + 1}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Action Buttons Sidebar (Thunderbird Standard) */}
          <div className="w-48 bg-slate-50 dark:bg-slate-950/60 border-l border-slate-100 dark:border-slate-800 p-3 space-y-2 flex flex-col justify-between">
            <div className="space-y-1.5">
              <button
                onClick={onOpenCreateFilter}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Novo Filtro...</span>
              </button>

              <button
                onClick={() => {
                  if (selectedFilter) onOpenEditFilter(selectedFilter);
                }}
                disabled={!selectedFilter}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Editar...</span>
              </button>

              <button
                onClick={() => {
                  if (selectedFilter && confirm(`Deseja realmente excluir o filtro "${selectedFilter.name}"?`)) {
                    onDeleteFilter(selectedFilter.id);
                  }
                }}
                disabled={!selectedFilter}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-red-600 dark:text-red-400 rounded-lg text-xs font-medium hover:bg-red-50 dark:hover:bg-red-950/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir</span>
              </button>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1.5">
                <button
                  onClick={() => onMoveFilterUp(selectedIndex)}
                  disabled={selectedIndex <= 0}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                  <span>Mover para Cima</span>
                </button>

                <button
                  onClick={() => onMoveFilterDown(selectedIndex)}
                  disabled={selectedIndex < 0 || selectedIndex >= filteredList.length - 1}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                  <span>Mover para Baixo</span>
                </button>
              </div>
            </div>

            {/* Hint Box */}
            <div className="p-2.5 rounded-lg bg-sky-50 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/40 text-[10px] text-sky-800 dark:text-sky-300 space-y-1">
              <div className="font-bold flex items-center gap-1">
                <Info className="w-3 h-3" />
                <span>Ordem de Prioridade</span>
              </div>
              <p>Os filtros no topo são processados primeiro sobre as mensagens recebidas.</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Thunderbird "Executar Agora" Control */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 flex items-center justify-between select-none">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Executar filtro(s) na pasta:
            </span>
            <select
              value={targetFolderForRun}
              onChange={(e) => setTargetFolderForRun(e.target.value)}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:border-sky-500"
            >
              {folders.map(f => (
                <option key={f.id} value={f.id}>{f.label}</option>
              ))}
            </select>

            <button
              onClick={handleRunNow}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:from-emerald-700 active:to-teal-700 text-white font-semibold rounded-lg shadow-xs transition-all hover:scale-[1.02]"
              title="Executar todas as regras ativas sobre as mensagens agora"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Executar Agora</span>
            </button>
          </div>

          {/* Feedback alert after run */}
          {runResult && (
            <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1 rounded-md border border-emerald-200 dark:border-emerald-800 animate-in fade-in">
              <CheckCircle className="w-4 h-4" />
              <span>{runResult.count} mensagem(ns) processada(s) e organizadas!</span>
            </div>
          )}

          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
