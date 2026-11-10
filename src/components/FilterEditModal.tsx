import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  SlidersHorizontal,
  CheckCircle,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import {
  MessageFilter,
  FilterCondition,
  FilterAction,
  FilterConditionField,
  FilterOperator,
  FilterActionType,
  Account,
  EmailTag
} from '../types/mail';

interface FilterEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  filterToEdit: MessageFilter | null;
  accounts: Account[];
  tags: EmailTag[];
  onSaveFilter: (filter: MessageFilter) => void;
}

export const FilterEditModal: React.FC<FilterEditModalProps> = ({
  isOpen,
  onClose,
  filterToEdit,
  accounts,
  tags,
  onSaveFilter,
}) => {
  const [name, setName] = useState(filterToEdit?.name || 'Novo Filtro de Mensagens');
  const [enabled, setEnabled] = useState(filterToEdit ? filterToEdit.enabled : true);
  const [matchMode, setMatchMode] = useState<'all' | 'any'>(filterToEdit?.matchMode || 'all');
  const [accountId, setAccountId] = useState<string | null>(filterToEdit?.accountId ?? null);

  const [conditions, setConditions] = useState<FilterCondition[]>(
    filterToEdit?.conditions && filterToEdit.conditions.length > 0
      ? filterToEdit.conditions
      : [{ id: `c_${Date.now()}`, field: 'from', operator: 'contains', value: '' }]
  );

  const [actions, setActions] = useState<FilterAction[]>(
    filterToEdit?.actions && filterToEdit.actions.length > 0
      ? filterToEdit.actions
      : [{ id: `a_${Date.now()}`, type: 'applyTag', targetTagId: tags[0]?.id || '' }]
  );

  if (!isOpen) return null;

  const handleAddCondition = () => {
    setConditions(prev => [
      ...prev,
      { id: `c_${Date.now()}_${Math.random()}`, field: 'subject', operator: 'contains', value: '' },
    ]);
  };

  const handleRemoveCondition = (id: string) => {
    if (conditions.length === 1) return;
    setConditions(prev => prev.filter(c => c.id !== id));
  };

  const handleUpdateCondition = (id: string, field: keyof FilterCondition, val: any) => {
    setConditions(prev => prev.map(c => c.id === id ? { ...c, [field]: val } : c));
  };

  const handleAddAction = () => {
    setActions(prev => [
      ...prev,
      { id: `a_${Date.now()}_${Math.random()}`, type: 'moveToFolder', targetFolderId: 'archive' },
    ]);
  };

  const handleRemoveAction = (id: string) => {
    if (actions.length === 1) return;
    setActions(prev => prev.filter(a => a.id !== id));
  };

  const handleUpdateAction = (id: string, field: keyof FilterAction, val: any) => {
    setActions(prev => prev.map(a => a.id === id ? { ...a, [field]: val } : a));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Informe um nome para o filtro.');
      return;
    }

    const savedFilter: MessageFilter = {
      id: filterToEdit ? filterToEdit.id : `flt_${Date.now()}`,
      name: name.trim(),
      enabled,
      matchMode,
      accountId,
      conditions,
      actions,
      lastRunTimestamp: filterToEdit?.lastRunTimestamp,
    };

    onSaveFilter(savedFilter);
    onClose();
  };

  const fieldLabels: Record<FilterConditionField, string> = {
    from: 'De (Remetente)',
    to: 'Para (Destinatário)',
    subject: 'Assunto',
    body: 'Corpo da Mensagem',
    hasAttachments: 'Contém Anexo',
  };

  const operatorLabels: Record<FilterOperator, string> = {
    contains: 'contém',
    doesNotContain: 'não contém',
    equals: 'é exatamente',
    beginsWith: 'começa com',
    endsWith: 'termina com',
  };

  const actionLabels: Record<FilterActionType, string> = {
    moveToFolder: 'Mover mensagem para pasta',
    applyTag: 'Aplicar marcador / tag',
    markAsRead: 'Marcar como lida',
    markAsStarred: 'Adicionar estrela (favorito)',
    markAsPinned: 'Fixar no topo',
    delete: 'Excluir mensagem (Lixeira)',
  };

  const folders = [
    { id: 'inbox', label: 'Caixa de Entrada' },
    { id: 'archive', label: 'Arquivados' },
    { id: 'trash', label: 'Lixeira' },
    { id: 'spam', label: 'Spam' },
    { id: 'sent', label: 'Enviados' },
    { id: 'drafts', label: 'Rascunhos' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-150 select-none">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl text-slate-900 dark:text-slate-100 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {filterToEdit ? 'Editar Regra de Filtro' : 'Nova Regra de Filtro de Mensagens'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Inspirado nas regras de filtragem automatizadas do Mozilla Thunderbird
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5 text-xs select-text">
          {/* Filter Name & Account Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2 space-y-1">
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                Nome do Filtro:
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Mover faturas para pasta Financeiro..."
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                Aplicar na Conta:
              </label>
              <select
                value={accountId || 'all'}
                onChange={(e) => setAccountId(e.target.value === 'all' ? null : e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
              >
                <option value="all">Todas as Contas (Unificada)</option>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Conditions Section (Thunderbird Matching Logic) */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                  1. Condições de Disparo
                </span>
                <span className="text-slate-400">·</span>
                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="matchMode"
                      value="all"
                      checked={matchMode === 'all'}
                      onChange={() => setMatchMode('all')}
                      className="text-sky-600 focus:ring-sky-500"
                    />
                    <span>Corresponder a <strong>TODAS</strong> as regras (AND)</span>
                  </label>
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="matchMode"
                      value="any"
                      checked={matchMode === 'any'}
                      onChange={() => setMatchMode('any')}
                      className="text-sky-600 focus:ring-sky-500"
                    />
                    <span>Corresponder a <strong>QUALQUER</strong> regra (OR)</span>
                  </label>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddCondition}
                className="flex items-center gap-1 px-2.5 py-1 text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/80 rounded-md font-semibold hover:bg-sky-100 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Condição</span>
              </button>
            </div>

            {/* Conditions rows */}
            <div className="space-y-2">
              {conditions.map((cond, index) => (
                <div key={cond.id} className="flex items-center gap-2">
                  <span className="w-6 text-slate-400 font-mono text-[11px] text-right">
                    #{index + 1}
                  </span>

                  {/* Field Selector */}
                  <select
                    value={cond.field}
                    onChange={(e) => handleUpdateCondition(cond.id, 'field', e.target.value as FilterConditionField)}
                    className="w-40 px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  >
                    <option value="from">{fieldLabels.from}</option>
                    <option value="to">{fieldLabels.to}</option>
                    <option value="subject">{fieldLabels.subject}</option>
                    <option value="body">{fieldLabels.body}</option>
                    <option value="hasAttachments">{fieldLabels.hasAttachments}</option>
                  </select>

                  {/* Operator Selector */}
                  <select
                    value={cond.operator}
                    onChange={(e) => handleUpdateCondition(cond.id, 'operator', e.target.value as FilterOperator)}
                    className="w-36 px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  >
                    <option value="contains">{operatorLabels.contains}</option>
                    <option value="doesNotContain">{operatorLabels.doesNotContain}</option>
                    <option value="equals">{operatorLabels.equals}</option>
                    <option value="beginsWith">{operatorLabels.beginsWith}</option>
                    <option value="endsWith">{operatorLabels.endsWith}</option>
                  </select>

                  {/* Value Input */}
                  {cond.field === 'hasAttachments' ? (
                    <select
                      value={cond.value || 'true'}
                      onChange={(e) => handleUpdateCondition(cond.id, 'value', e.target.value)}
                      className="flex-1 px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                    >
                      <option value="true">Sim (possui anexos)</option>
                      <option value="false">Não (sem anexos)</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={cond.value}
                      onChange={(e) => handleUpdateCondition(cond.id, 'value', e.target.value)}
                      placeholder="Texto ou palavra-chave..."
                      className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                      required
                    />
                  )}

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveCondition(cond.id)}
                    disabled={conditions.length === 1}
                    className="p-1.5 rounded text-slate-400 hover:text-red-500 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Remover condição"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Actions Section */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                2. Executar Estas Ações Automaticamente
              </span>
              <button
                type="button"
                onClick={handleAddAction}
                className="flex items-center gap-1 px-2.5 py-1 text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/80 rounded-md font-semibold hover:bg-sky-100 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Ação</span>
              </button>
            </div>

            {/* Actions rows */}
            <div className="space-y-2">
              {actions.map((act, index) => (
                <div key={act.id} className="flex items-center gap-2">
                  <span className="w-6 text-slate-400 font-mono text-[11px] text-right">
                    #{index + 1}
                  </span>

                  {/* Action Type */}
                  <select
                    value={act.type}
                    onChange={(e) => handleUpdateAction(act.id, 'type', e.target.value as FilterActionType)}
                    className="w-56 px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  >
                    <option value="moveToFolder">{actionLabels.moveToFolder}</option>
                    <option value="applyTag">{actionLabels.applyTag}</option>
                    <option value="markAsRead">{actionLabels.markAsRead}</option>
                    <option value="markAsStarred">{actionLabels.markAsStarred}</option>
                    <option value="markAsPinned">{actionLabels.markAsPinned}</option>
                    <option value="delete">{actionLabels.delete}</option>
                  </select>

                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />

                  {/* Target Parameters according to Action Type */}
                  {act.type === 'moveToFolder' && (
                    <select
                      value={act.targetFolderId || 'archive'}
                      onChange={(e) => handleUpdateAction(act.id, 'targetFolderId', e.target.value)}
                      className="flex-1 px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                    >
                      {folders.map(f => (
                        <option key={f.id} value={f.id}>{f.label}</option>
                      ))}
                    </select>
                  )}

                  {act.type === 'applyTag' && (
                    <select
                      value={act.targetTagId || tags[0]?.id}
                      onChange={(e) => handleUpdateAction(act.id, 'targetTagId', e.target.value)}
                      className="flex-1 px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                    >
                      {tags.map(t => (
                        <option key={t.id} value={t.id}>Marcador: {t.name}</option>
                      ))}
                    </select>
                  )}

                  {['markAsRead', 'markAsStarred', 'markAsPinned', 'delete'].includes(act.type) && (
                    <div className="flex-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-800/60 rounded-lg text-slate-500 text-[11px] font-medium">
                      (Nenhum parâmetro extra necessário)
                    </div>
                  )}

                  {/* Remove Action */}
                  <button
                    type="button"
                    onClick={() => handleRemoveAction(act.id)}
                    disabled={actions.length === 1}
                    className="p-1.5 rounded text-slate-400 hover:text-red-500 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Remover ação"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Toggle Enable State */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="filterEnabledToggle"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
            />
            <label htmlFor="filterEnabledToggle" className="font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
              Ativar este filtro imediatamente
            </label>
          </div>

          {/* Footer Submit Buttons */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5 select-none">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors font-medium"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white rounded-lg shadow-sm transition-colors"
            >
              Salvar Regra
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
