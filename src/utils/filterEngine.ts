import { EmailThread, MessageFilter, FilterCondition, FilterAction } from '../types/mail';

export const DEFAULT_FILTERS: MessageFilter[] = [
  {
    id: 'flt_finances',
    name: 'Auto-organizar Faturas & Contabilidade',
    enabled: true,
    matchMode: 'any',
    accountId: null, // Todas as contas
    conditions: [
      { id: 'c1', field: 'subject', operator: 'contains', value: 'fatura' },
      { id: 'c2', field: 'subject', operator: 'contains', value: 'balanço' },
      { id: 'c3', field: 'body', operator: 'contains', value: 'boleto' },
    ],
    actions: [
      { id: 'a1', type: 'applyTag', targetTagId: 'tag_finances' },
    ],
  },
  {
    id: 'flt_github_deploys',
    name: 'Arquivar Notificações de Deploy & CI/CD',
    enabled: true,
    matchMode: 'all',
    accountId: null,
    conditions: [
      { id: 'c4', field: 'from', operator: 'contains', value: 'github.com' },
      { id: 'c5', field: 'subject', operator: 'contains', value: 'deploy' },
    ],
    actions: [
      { id: 'a2', type: 'moveToFolder', targetFolderId: 'archive' },
      { id: 'a3', type: 'markAsRead' },
    ],
  },
  {
    id: 'flt_urgent_contracts',
    name: 'Destacar Contratos Urgentes com Estrela',
    enabled: true,
    matchMode: 'any',
    accountId: null,
    conditions: [
      { id: 'c6', field: 'subject', operator: 'contains', value: 'urgente' },
      { id: 'c7', field: 'subject', operator: 'contains', value: 'contrato' },
    ],
    actions: [
      { id: 'a4', type: 'markAsStarred' },
      { id: 'a5', type: 'markAsPinned' },
    ],
  },
];

/**
 * Avalia uma única condição de filtro contra uma thread de e-mail
 */
export function evaluateCondition(thread: EmailThread, condition: FilterCondition): boolean {
  let haystack = '';

  switch (condition.field) {
    case 'from':
      haystack = thread.participants.map(p => `${p.name} ${p.email}`).join(' ');
      break;
    case 'to':
      haystack = thread.messages
        .flatMap(m => m.to.map(t => `${t.name} ${t.email}`))
        .join(' ');
      break;
    case 'subject':
      haystack = thread.subject;
      break;
    case 'body':
      haystack = thread.messages.map(m => m.bodyText).join(' ');
      break;
    case 'hasAttachments':
      return condition.operator === 'equals'
        ? String(thread.hasAttachments) === condition.value.toLowerCase()
        : thread.hasAttachments;
    default:
      haystack = '';
  }

  const normalizedHaystack = haystack.toLowerCase().trim();
  const needle = (condition.value || '').toLowerCase().trim();

  if (!needle) return true;

  switch (condition.operator) {
    case 'contains':
      return normalizedHaystack.includes(needle);
    case 'doesNotContain':
      return !normalizedHaystack.includes(needle);
    case 'equals':
      return normalizedHaystack === needle;
    case 'beginsWith':
      return normalizedHaystack.startsWith(needle);
    case 'endsWith':
      return normalizedHaystack.endsWith(needle);
    default:
      return false;
  }
}

/**
 * Avalia se uma thread satisfaz todas ou qualquer uma das condições de um filtro
 */
export function evaluateFilter(thread: EmailThread, filter: MessageFilter): boolean {
  if (!filter.enabled) return false;
  if (filter.conditions.length === 0) return false;

  // Se o filtro for restrito a uma conta específica
  if (filter.accountId && thread.accountId !== filter.accountId) {
    return false;
  }

  if (filter.matchMode === 'all') {
    return filter.conditions.every(cond => evaluateCondition(thread, cond));
  } else {
    return filter.conditions.some(cond => evaluateCondition(thread, cond));
  }
}

/**
 * Aplica as ações definidas em um filtro sobre uma thread
 */
export function applyActionsToThread(thread: EmailThread, actions: FilterAction[]): { updatedThread: EmailThread; changed: boolean } {
  let changed = false;
  let newFolderId = thread.folderId;
  let newIsRead = thread.isRead;
  let newIsStarred = thread.isStarred;
  let newIsPinned = thread.isPinned;
  const newTags = [...thread.tags];

  for (const act of actions) {
    switch (act.type) {
      case 'moveToFolder':
        if (act.targetFolderId && newFolderId !== act.targetFolderId) {
          newFolderId = act.targetFolderId;
          changed = true;
        }
        break;
      case 'applyTag':
        if (act.targetTagId && !newTags.includes(act.targetTagId)) {
          newTags.push(act.targetTagId);
          changed = true;
        }
        break;
      case 'markAsRead':
        if (!newIsRead) {
          newIsRead = true;
          changed = true;
        }
        break;
      case 'markAsStarred':
        if (!newIsStarred) {
          newIsStarred = true;
          changed = true;
        }
        break;
      case 'markAsPinned':
        if (!newIsPinned) {
          newIsPinned = true;
          changed = true;
        }
        break;
      case 'delete':
        if (newFolderId !== 'trash') {
          newFolderId = 'trash';
          changed = true;
        }
        break;
    }
  }

  return {
    updatedThread: {
      ...thread,
      folderId: newFolderId,
      isRead: newIsRead,
      isStarred: newIsStarred,
      isPinned: newIsPinned,
      tags: newTags,
    },
    changed,
  };
}

/**
 * Executa todos os filtros habilitados em lote sobre um conjunto de threads (estilo Thunderbird "Executar Agora")
 */
export function runFiltersOnThreads(
  threads: EmailThread[],
  filters: MessageFilter[],
  targetFolderId?: string | null
): {
  updatedThreads: EmailThread[];
  matchedCount: number;
  reportMessages: string[];
} {
  const activeFilters = filters.filter(f => f.enabled);
  if (activeFilters.length === 0) {
    return { updatedThreads: threads, matchedCount: 0, reportMessages: ['Nenhum filtro ativo configurado.'] };
  }

  let matchedCount = 0;
  const reportMessages: string[] = [];

  const updatedThreads = threads.map((th) => {
    // Se foi filtrado por pasta alvo e a thread não estiver nela, ignorar
    if (targetFolderId && targetFolderId !== 'all' && th.folderId !== targetFolderId) {
      return th;
    }

    let current = th;
    for (const filter of activeFilters) {
      if (evaluateFilter(current, filter)) {
        const { updatedThread, changed } = applyActionsToThread(current, filter.actions);
        if (changed) {
          current = updatedThread;
          matchedCount++;
          reportMessages.push(`Filtro "${filter.name}" aplicado à conversa: "${current.subject.slice(0, 40)}..."`);
        }
      }
    }

    return current;
  });

  return { updatedThreads, matchedCount, reportMessages };
}
