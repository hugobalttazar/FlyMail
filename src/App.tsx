import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  AppSidebar,
} from './components/AppSidebar';
import {
  FolderList,
} from './components/FolderList';
import {
  EmailList,
} from './components/EmailList';
import {
  EmailViewer,
} from './components/EmailViewer';
import {
  RightSidebar,
} from './components/RightSidebar';
import {
  SpeedReaderModal,
} from './components/SpeedReaderModal';
import {
  ComposeModal,
} from './components/ComposeModal';
import {
  SettingsModal,
} from './components/SettingsModal';
import {
  InstallModal,
} from './components/InstallModal';
import {
  SnoozeModal,
} from './components/SnoozeModal';
import {
  CalendarView,
} from './components/CalendarView';
import {
  ContactsView,
} from './components/ContactsView';
import {
  TasksView,
} from './components/TasksView';
import {
  MessageFiltersModal,
} from './components/MessageFiltersModal';
import {
  FilterEditModal,
} from './components/FilterEditModal';
import {
  AccountWizardModal,
} from './components/AccountWizardModal';
import {
  WelcomeOnboarding,
} from './components/WelcomeOnboarding';

import {
  Account,
  AppView,
  CalendarEvent,
  ComposeDraft,
  Contact,
  EmailTag,
  EmailThread,
  MessageFilter,
  TaskItem,
  ThemeAccent,
} from './types/mail';

import {
  DEFAULT_FILTERS,
  runFiltersOnThreads,
  evaluateFilter,
  applyActionsToThread,
} from './utils/filterEngine';

import {
  EMAIL_TAGS,
  MOCK_CONTACTS,
  MOCK_EVENTS,
  MOCK_TASKS,
} from './data/mockEmails';

export default function App() {
  // Persistence with localStorage (Inicia zerado se não houver dados salvos no PC)
  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem('flymail_accounts') || localStorage.getItem('aeromail_accounts');
    return saved ? JSON.parse(saved) : [];
  });

  const [threads, setThreads] = useState<EmailThread[]>(() => {
    const saved = localStorage.getItem('flymail_threads') || localStorage.getItem('aeromail_threads');
    return saved ? JSON.parse(saved) : [];
  });

  const [tags, setTags] = useState<EmailTag[]>(() => {
    const saved = localStorage.getItem('flymail_tags') || localStorage.getItem('aeromail_tags');
    return saved ? JSON.parse(saved) : EMAIL_TAGS;
  });

  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem('aeromail_contacts');
    return saved ? JSON.parse(saved) : MOCK_CONTACTS;
  });

  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem('aeromail_events');
    return saved ? JSON.parse(saved) : MOCK_EVENTS;
  });

  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    const saved = localStorage.getItem('aeromail_tasks');
    return saved ? JSON.parse(saved) : MOCK_TASKS;
  });

  // Message Filters (Thunderbird-Style Rules)
  const [filters, setFilters] = useState<MessageFilter[]>(() => {
    const saved = localStorage.getItem('aeromail_filters');
    return saved ? JSON.parse(saved) : DEFAULT_FILTERS;
  });

  // Navigation & Filtering
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null); // null = Unified Inbox
  const [selectedFolder, setSelectedFolder] = useState<string>('inbox');
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(() => threads[0]?.id || null);
  const [selectedThreadIds, setSelectedThreadIds] = useState<string[]>([]);
  const [activeView, setActiveView] = useState<AppView>('mail');

  // Search & Quick Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOnlyUnread, setFilterOnlyUnread] = useState(false);
  const [filterOnlyAttachments, setFilterOnlyAttachments] = useState(false);

  // Layout & Theme Preferences
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('aeromail_darkmode');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [accentColor, setAccentColor] = useState<ThemeAccent>('blue');
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);

  // Modals state
  const [speedReaderOpen, setSpeedReaderOpen] = useState(false);
  const [speedReaderText, setSpeedReaderText] = useState('');
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeInitialDraft, setComposeInitialDraft] = useState<Partial<ComposeDraft>>({});
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [installModalOpen, setInstallModalOpen] = useState(false);
  const [snoozeModalOpen, setSnoozeModalOpen] = useState(false);
  const [snoozeTargetThreadId, setSnoozeTargetThreadId] = useState<string | null>(null);

  // Message Filters Modals State
  const [messageFiltersModalOpen, setMessageFiltersModalOpen] = useState(false);
  const [filterEditModalOpen, setFilterEditModalOpen] = useState(false);
  const [filterToEdit, setFilterToEdit] = useState<MessageFilter | null>(null);

  // Account Wizard State (Gmail, Outlook, iCloud, IMAP)
  const [accountWizardOpen, setAccountWizardOpen] = useState(false);

  // Sync accounts to localStorage
  useEffect(() => {
    localStorage.setItem('flymail_accounts', JSON.stringify(accounts));
  }, [accounts]);

  // Sync filters to localStorage
  useEffect(() => {
    localStorage.setItem('flymail_filters', JSON.stringify(filters));
  }, [filters]);

  // Sync dark mode class on HTML documentElement
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('flymail_darkmode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Sync threads to localStorage
  useEffect(() => {
    localStorage.setItem('flymail_threads', JSON.stringify(threads));
  }, [threads]);

  // Sync tasks to localStorage
  useEffect(() => {
    localStorage.setItem('flymail_tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Active account object
  const activeAccount = useMemo(() => {
    return accounts.find(a => a.id === selectedAccountId) || null;
  }, [accounts, selectedAccountId]);

  // Filtered threads logic
  const filteredThreads = useMemo(() => {
    return threads.filter((t) => {
      // 1. Account filter (Unified Inbox includes all accounts)
      if (selectedAccountId && t.accountId !== selectedAccountId) {
        return false;
      }

      // 2. Folder or Tag filter
      if (selectedTagId) {
        if (!t.tags.includes(selectedTagId)) return false;
      } else {
        if (selectedFolder === 'starred') {
          if (!t.isStarred) return false;
        } else if (selectedFolder === 'snoozed') {
          if (!t.isSnoozed) return false;
        } else {
          if (t.folderId !== selectedFolder) return false;
        }
      }

      // 3. Quick unread toggle
      if (filterOnlyUnread && t.isRead) return false;

      // 4. Quick attachments toggle
      if (filterOnlyAttachments && !t.hasAttachments) return false;

      // 5. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchSubject = t.subject.toLowerCase().includes(q);
        const matchSnippet = t.snippet.toLowerCase().includes(q);
        const matchSender = t.participants.some(p => p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q));
        if (!matchSubject && !matchSnippet && !matchSender) return false;
      }

      return true;
    }).sort((a, b) => {
      // Pinned threads always on top
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.lastMessageTimestamp - a.lastMessageTimestamp;
    });
  }, [threads, selectedAccountId, selectedFolder, selectedTagId, filterOnlyUnread, filterOnlyAttachments, searchQuery]);

  // Selected thread object
  const activeThread = useMemo(() => {
    return threads.find(t => t.id === selectedThreadId) || null;
  }, [threads, selectedThreadId]);

  // Compute unread counts per folder & tag
  const unreadCounts = useMemo(() => {
    const counts: Record<string, number> = {
      inbox: 0,
      starred: 0,
      snoozed: 0,
      sent: 0,
      drafts: 0,
      archive: 0,
      trash: 0,
      spam: 0,
    };

    threads.forEach((t) => {
      if (selectedAccountId && t.accountId !== selectedAccountId) return;

      if (!t.isRead) {
        if (counts[t.folderId] !== undefined) {
          counts[t.folderId]++;
        }
        if (t.isStarred) counts['starred']++;
        if (t.isSnoozed) counts['snoozed']++;

        t.tags.forEach((tagId) => {
          counts[`tag_${tagId}`] = (counts[`tag_${tagId}`] || 0) + 1;
        });
      }
    });

    return counts;
  }, [threads, selectedAccountId]);

  // Keep selectedThreadId valid
  useEffect(() => {
    if (filteredThreads.length > 0) {
      const exists = filteredThreads.some(t => t.id === selectedThreadId);
      if (!exists) {
        setSelectedThreadId(filteredThreads[0].id);
      }
    } else {
      setSelectedThreadId(null);
    }
  }, [filteredThreads, selectedThreadId]);

  // Handlers for Thread Actions
  const handleSelectThread = useCallback((threadId: string) => {
    setSelectedThreadId(threadId);
    // Mark as read automatically when opening
    setThreads(prev => prev.map(t => {
      if (t.id === threadId && !t.isRead) {
        return { ...t, isRead: true };
      }
      return t;
    }));
  }, []);

  const handleToggleStar = useCallback((threadId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setThreads(prev => prev.map(t => {
      if (t.id === threadId) {
        return { ...t, isStarred: !t.isStarred };
      }
      return t;
    }));
  }, []);

  const handleTogglePin = useCallback((threadId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setThreads(prev => prev.map(t => {
      if (t.id === threadId) {
        return { ...t, isPinned: !t.isPinned };
      }
      return t;
    }));
  }, []);

  const handleToggleRead = useCallback((threadId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setThreads(prev => prev.map(t => {
      if (t.id === threadId) {
        return { ...t, isRead: !t.isRead };
      }
      return t;
    }));
  }, []);

  const handleArchive = useCallback((threadId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setThreads(prev => prev.map(t => {
      if (t.id === threadId) {
        return { ...t, folderId: 'archive' };
      }
      return t;
    }));
  }, []);

  const handleTrash = useCallback((threadId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setThreads(prev => prev.map(t => {
      if (t.id === threadId) {
        return { ...t, folderId: 'trash' };
      }
      return t;
    }));
  }, []);

  const handleOpenSnooze = useCallback((threadId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSnoozeTargetThreadId(threadId);
    setSnoozeModalOpen(true);
  }, []);

  const handleApplySnooze = useCallback((snoozeLabel: string) => {
    if (!snoozeTargetThreadId) return;
    setThreads(prev => prev.map(t => {
      if (t.id === snoozeTargetThreadId) {
        return {
          ...t,
          isSnoozed: true,
          snoozedUntil: snoozeLabel,
        };
      }
      return t;
    }));
  }, [snoozeTargetThreadId]);

  const handleToggleSelectThread = useCallback((threadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedThreadIds(prev => 
      prev.includes(threadId) ? prev.filter(id => id !== threadId) : [...prev, threadId]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedThreadIds.length === filteredThreads.length) {
      setSelectedThreadIds([]);
    } else {
      setSelectedThreadIds(filteredThreads.map(t => t.id));
    }
  }, [selectedThreadIds.length, filteredThreads]);

  // Speed Reader Trigger
  const handleLaunchSpeedReader = useCallback((text: string) => {
    setSpeedReaderText(text);
    setSpeedReaderOpen(true);
  }, []);

  // Quick Reply inside thread
  const handleQuickReply = useCallback((threadId: string, replyText: string) => {
    const activeAcc = accounts[0];
    const newMsgId = `msg_${Date.now()}`;
    setThreads(prev => prev.map(t => {
      if (t.id === threadId) {
        const updatedMessages = [
          ...t.messages,
          {
            id: newMsgId,
            threadId: t.id,
            accountId: t.accountId,
            from: { name: activeAcc.name, email: activeAcc.email },
            to: t.participants.filter(p => p.email !== activeAcc.email),
            date: 'Agora',
            timestamp: Date.now(),
            subject: `Re: ${t.subject}`,
            snippet: replyText.slice(0, 80),
            bodyText: replyText,
            isRead: true,
            isStarred: false,
            isPinned: false,
            isSnoozed: false,
            folderId: t.folderId,
            tags: t.tags,
            attachments: [],
          },
        ];
        return {
          ...t,
          messageCount: t.messageCount + 1,
          snippet: `Você: ${replyText.slice(0, 80)}`,
          lastMessageDate: 'Agora',
          lastMessageTimestamp: Date.now(),
          messages: updatedMessages,
        };
      }
      return t;
    }));
  }, [accounts]);

  // Forward email
  const handleForward = useCallback((thread: EmailThread) => {
    setComposeInitialDraft({
      subject: `Fwd: ${thread.subject}`,
      body: `\n\n---------- Mensagem Encaminhada ----------\nAssunto: ${thread.subject}\n\n${thread.messages[thread.messages.length - 1]?.bodyText}`,
    });
    setComposeOpen(true);
  }, []);

  // Send new composed email
  const handleSendDraft = useCallback((draft: ComposeDraft) => {
    const newThreadId = `th_${Date.now()}`;
    const newMsgId = `msg_${Date.now()}`;
    const acc = accounts.find(a => a.id === draft.fromAccountId) || accounts[0];

    const newThread: EmailThread = {
      id: newThreadId,
      accountId: draft.fromAccountId,
      subject: draft.subject,
      snippet: draft.body.slice(0, 90) || '(Sem conteúdo)',
      participants: [
        { name: acc.name, email: acc.email },
        { name: draft.to, email: draft.to },
      ],
      lastMessageDate: 'Agora',
      lastMessageTimestamp: Date.now(),
      messageCount: 1,
      isRead: true,
      isStarred: false,
      isPinned: false,
      isSnoozed: false,
      folderId: 'sent',
      tags: [],
      hasAttachments: draft.attachments.length > 0,
      messages: [
        {
          id: newMsgId,
          threadId: newThreadId,
          accountId: draft.fromAccountId,
          from: { name: acc.name, email: acc.email },
          to: [{ name: draft.to, email: draft.to }],
          date: 'Agora',
          timestamp: Date.now(),
          subject: draft.subject,
          snippet: draft.body.slice(0, 90),
          bodyText: draft.body,
          isRead: true,
          isStarred: false,
          isPinned: false,
          isSnoozed: false,
          folderId: 'sent',
          tags: [],
          attachments: draft.attachments,
        },
      ],
    };

    // Aplica os filtros automatizados ativos na mensagem recém-criada
    let processedThread = newThread;
    const activeFilters = filters.filter(f => f.enabled);
    for (const flt of activeFilters) {
      if (evaluateFilter(processedThread, flt)) {
        const { updatedThread } = applyActionsToThread(processedThread, flt.actions);
        processedThread = updatedThread;
      }
    }

    setThreads(prev => [processedThread, ...prev]);
    setSelectedFolder(processedThread.folderId);
    setSelectedThreadId(processedThread.id);
    setActiveView('mail');
  }, [accounts, filters]);

  // Message Filters Handlers (Thunderbird-Style)
  const handleToggleFilter = useCallback((filterId: string) => {
    setFilters(prev => prev.map(f => f.id === filterId ? { ...f, enabled: !f.enabled } : f));
  }, []);

  const handleDeleteFilter = useCallback((filterId: string) => {
    setFilters(prev => prev.filter(f => f.id !== filterId));
  }, []);

  const handleMoveFilterUp = useCallback((index: number) => {
    if (index <= 0) return;
    setFilters(prev => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  }, []);

  const handleMoveFilterDown = useCallback((index: number) => {
    setFilters(prev => {
      if (index >= prev.length - 1) return prev;
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  }, []);

  const handleSaveFilter = useCallback((filter: MessageFilter) => {
    setFilters(prev => {
      const existsIndex = prev.findIndex(f => f.id === filter.id);
      if (existsIndex >= 0) {
        const copy = [...prev];
        copy[existsIndex] = filter;
        return copy;
      } else {
        return [filter, ...prev];
      }
    });
  }, []);

  const handleRunFiltersNow = useCallback((targetFolderId: string) => {
    const { updatedThreads, matchedCount, reportMessages } = runFiltersOnThreads(
      threads,
      filters,
      targetFolderId
    );
    setThreads(updatedThreads);
    return { matchedCount, reportMessages };
  }, [threads, filters]);

  // Contacts Actions
  const handleComposeToContact = useCallback((contact: Contact) => {
    setComposeInitialDraft({
      to: contact.email,
      subject: '',
      body: `Olá ${contact.name},\n\n`,
    });
    setComposeOpen(true);
  }, []);

  const handleAddContact = useCallback((newContact: Partial<Contact>) => {
    const created: Contact = {
      id: `c_${Date.now()}`,
      name: newContact.name || 'Sem Nome',
      email: newContact.email || '',
      role: newContact.role,
      company: newContact.company,
      phone: newContact.phone,
    };
    setContacts(prev => [created, ...prev]);
  }, []);

  // Tasks Actions
  const handleToggleTask = useCallback((taskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return { ...t, completed: !t.completed };
      }
      return t;
    }));
  }, []);

  const handleAddTask = useCallback((title: string, priority: 'high' | 'medium' | 'low', tag?: string) => {
    const newTask: TaskItem = {
      id: `tsk_${Date.now()}`,
      title,
      completed: false,
      dueDate: 'Hoje',
      priority,
      tag,
    };
    setTasks(prev => [newTask, ...prev]);
  }, []);

  const handleDeleteTask = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  }, []);

  // Calendar Actions
  const handleAddEvent = useCallback((title: string, time: string, category: 'work' | 'personal' | 'meeting' = 'work') => {
    const newEvent: CalendarEvent = {
      id: `ev_${Date.now()}`,
      title,
      time,
      duration: '45 min',
      date: new Date().toISOString().split('T')[0],
      color: category === 'meeting' ? '#8B5CF6' : category === 'personal' ? '#10B981' : '#3B82F6',
      category,
    };
    setEvents(prev => [newEvent, ...prev]);
  }, []);

  // Add Account in Settings & Connection Wizard
  const handleAddAccount = useCallback((name: string, email: string, color: string) => {
    const newAcc: Account = {
      id: `acc_${Date.now()}`,
      name,
      email,
      color,
      unreadCount: 0,
      provider: email.includes('gmail') ? 'google' : email.includes('outlook') ? 'outlook' : 'imap',
    };
    setAccounts(prev => [...prev, newAcc]);
  }, []);

  // Excluir conta conectada do FlyMail
  const handleDeleteAccount = useCallback((accountId: string) => {
    setAccounts(prev => prev.filter(acc => acc.id !== accountId));
    // Remove threads associadas a esta conta para limpar os dados locais
    setThreads(prev => prev.filter(t => t.accountId !== accountId));
    // Se a conta excluída estava selecionada, volta para a Caixa Unificada
    setSelectedAccountId(prev => (prev === accountId ? null : prev));
  }, []);

  // Handle Full Account Connection from Provider Wizard (Gmail, Outlook, iCloud, IMAP)
  const handleAccountConnected = useCallback((newAccount: Account) => {
    setAccounts(prev => {
      // Evita duplicidade se a mesma conta for autenticada novamente
      const exists = prev.some(a => a.id === newAccount.id || a.email.toLowerCase() === newAccount.email.toLowerCase());
      if (exists) {
        return prev.map(a => a.id === newAccount.id || a.email.toLowerCase() === newAccount.email.toLowerCase() ? newAccount : a);
      }
      return [...prev, newAccount];
    });

    // Cria e-mails de sincronização inicial na caixa de entrada da nova conta
    const providerLabel = newAccount.provider.toUpperCase();
    const welcomeThreadId = `th_sync_${Date.now()}`;
    const welcomeThread: EmailThread = {
      id: welcomeThreadId,
      accountId: newAccount.id,
      subject: `Sua conta ${newAccount.name} (${providerLabel}) foi conectada ao FlyMail`,
      snippet: `Configuração sincronizada com segurança máxima. Seus e-mails e pastas já estão disponíveis...`,
      participants: [
        { name: `FlyMail Sync Engine (${providerLabel})`, email: `system-sync@flymail.app` },
        { name: newAccount.name, email: newAccount.email },
      ],
      lastMessageDate: 'Agora',
      lastMessageTimestamp: Date.now(),
      messageCount: 1,
      isRead: false,
      isStarred: true,
      isPinned: true,
      isSnoozed: false,
      folderId: 'inbox',
      tags: [],
      hasAttachments: false,
      messages: [
        {
          id: `msg_sync_${Date.now()}`,
          threadId: welcomeThreadId,
          accountId: newAccount.id,
          from: { name: `FlyMail Sync (${providerLabel})`, email: `system-sync@flymail.app` },
          to: [{ name: newAccount.name, email: newAccount.email }],
          date: 'Agora',
          timestamp: Date.now(),
          subject: `Sua conta ${newAccount.name} (${providerLabel}) foi conectada ao FlyMail`,
          snippet: `Configuração sincronizada com segurança máxima.`,
          bodyText: `Olá, ${newAccount.name}!\n\nSua conta ${newAccount.email} foi sincronizada com sucesso no FlyMail.\n\nDetalhes da Conexão:\n- Provedor: ${providerLabel}\n- Modo de Autenticação: ${newAccount.provider === 'google' ? 'Google OAuth 2.0 (Segurança Máxima Oficial)' : 'IMAP/SMTP com Criptografia TLS'}\n- Servidor de Entrada (IMAP): ${newAccount.connectionConfig?.incomingHost || 'imap.servidor.com'}:${newAccount.connectionConfig?.incomingPort || 993} (${newAccount.connectionConfig?.incomingSecurity || 'SSL'})\n- Servidor de Saída (SMTP): ${newAccount.connectionConfig?.outgoingHost || 'smtp.servidor.com'}:${newAccount.connectionConfig?.outgoingPort || 587} (${newAccount.connectionConfig?.outgoingSecurity || 'STARTTLS'})\n\nAgora você pode alternar para esta conta individualmente pelo ícone colorido na barra lateral esquerda ou visualizar todas as suas mensagens agregadas na Caixa Unificada (Unified Inbox).\n\nBoas leituras com o Speed Reader e alta produtividade!\nEquipe FlyMail`,
          isRead: false,
          isStarred: true,
          isPinned: true,
          isSnoozed: false,
          folderId: 'inbox',
          tags: [],
          attachments: [],
        },
      ],
    };

    setThreads(prev => [welcomeThread, ...prev]);
    setSelectedAccountId(newAccount.id);
    setSelectedFolder('inbox');
    setSelectedThreadId(welcomeThreadId);
    setActiveView('mail');
  }, []);

  // Global Keyboard Shortcuts (Mailbird-style)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // 'c' to Compose
      if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        setComposeInitialDraft({});
        setComposeOpen(true);
      }
      // 'e' to Archive
      else if (e.key === 'e' || e.key === 'E') {
        if (selectedThreadId) {
          e.preventDefault();
          handleArchive(selectedThreadId);
        }
      }
      // '#' or Delete to Trash
      else if (e.key === '#' || e.key === 'Delete') {
        if (selectedThreadId) {
          e.preventDefault();
          handleTrash(selectedThreadId);
        }
      }
      // 's' to Toggle Star
      else if (e.key === 's' || e.key === 'S') {
        if (selectedThreadId) {
          e.preventDefault();
          handleToggleStar(selectedThreadId);
        }
      }
      // 'u' to Toggle Read
      else if (e.key === 'u' || e.key === 'U') {
        if (selectedThreadId) {
          e.preventDefault();
          handleToggleRead(selectedThreadId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedThreadId, handleArchive, handleTrash, handleToggleStar, handleToggleRead]);

  // Se não houver nenhuma conta configurada, exibe a tela de boas-vindas / onboarding guiado de primeiro acesso
  if (accounts.length === 0) {
    return (
      <div className="h-screen w-screen overflow-hidden bg-slate-950 font-sans antialiased">
        <WelcomeOnboarding
          onAccountAdded={handleAccountConnected}
          onOpenManualWizard={() => setAccountWizardOpen(true)}
        />

        {/* Account Wizard Modal para conexão alternativa (Outlook, iCloud, IMAP) */}
        <AccountWizardModal
          isOpen={accountWizardOpen}
          onClose={() => setAccountWizardOpen(false)}
          onAccountConnected={handleAccountConnected}
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased">
      {/* 1. App Sidebar (Narrow Left Vertical Nav: Accounts & Apps) */}
      <AppSidebar
        accounts={accounts}
        selectedAccountId={selectedAccountId}
        onSelectAccount={setSelectedAccountId}
        activeView={activeView}
        onChangeView={setActiveView}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(prev => !prev)}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenInstallModal={() => setInstallModalOpen(true)}
        rightSidebarOpen={rightSidebarOpen}
        onToggleRightSidebar={() => setRightSidebarOpen(prev => !prev)}
        onOpenAccountWizard={() => setAccountWizardOpen(true)}
      />

      {/* 2. Main View Switcher */}
      {activeView === 'mail' && (
        <div className="flex-1 flex overflow-hidden">
          {/* 2A. Folders & Tags Column */}
          <FolderList
            selectedFolder={selectedFolder}
            onSelectFolder={setSelectedFolder}
            selectedTagId={selectedTagId}
            onSelectTag={setSelectedTagId}
            tags={tags}
            activeAccount={activeAccount}
            unreadCounts={unreadCounts}
            onOpenCompose={() => {
              setComposeInitialDraft({});
              setComposeOpen(true);
            }}
            onCreateTagPrompt={() => {
              const name = prompt('Nome do novo marcador:');
              if (name && name.trim()) {
                const newTag: EmailTag = {
                  id: `tag_${Date.now()}`,
                  name: name.trim(),
                  color: '#0284C7',
                  badgeBg: 'bg-sky-50 dark:bg-sky-950/40',
                  badgeText: 'text-sky-700 dark:text-sky-300',
                };
                setTags(prev => [...prev, newTag]);
              }
            }}
          />

          {/* 2B. Email List Column (Central Message List with Hover Actions) */}
          <EmailList
            threads={filteredThreads}
            selectedThreadId={selectedThreadId}
            onSelectThread={handleSelectThread}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filterOnlyUnread={filterOnlyUnread}
            onToggleFilterUnread={() => setFilterOnlyUnread(prev => !prev)}
            filterOnlyAttachments={filterOnlyAttachments}
            onToggleFilterAttachments={() => setFilterOnlyAttachments(prev => !prev)}
            accounts={accounts}
            tags={tags}
            onToggleStar={handleToggleStar}
            onTogglePin={handleTogglePin}
            onToggleRead={handleToggleRead}
            onArchive={handleArchive}
            onTrash={handleTrash}
            onSnoozeClick={handleOpenSnooze}
            selectedThreadIds={selectedThreadIds}
            onToggleSelectThread={handleToggleSelectThread}
            onSelectAll={handleSelectAll}
            onRefresh={() => {
              // Simulated instant sync feedback
              const originalCount = threads.length;
              alert(`Sincronização concluída! ${originalCount} conversas atualizadas.`);
            }}
            onOpenMessageFilters={() => setMessageFiltersModalOpen(true)}
          />

          {/* 2C. Reading Pane (Email Viewer & Speed Reader trigger) */}
          <EmailViewer
            thread={activeThread}
            accounts={accounts}
            tags={tags}
            onToggleStar={handleToggleStar}
            onArchive={handleArchive}
            onTrash={handleTrash}
            onSnooze={handleOpenSnooze}
            onLaunchSpeedReader={handleLaunchSpeedReader}
            onQuickReply={handleQuickReply}
            onForward={handleForward}
          />
        </div>
      )}

      {/* 3. Calendar View */}
      {activeView === 'calendar' && (
        <CalendarView
          events={events}
          onAddEvent={handleAddEvent}
        />
      )}

      {/* 4. Contacts View */}
      {activeView === 'contacts' && (
        <ContactsView
          contacts={contacts}
          onComposeTo={handleComposeToContact}
          onAddContact={handleAddContact}
        />
      )}

      {/* 5. Tasks View */}
      {activeView === 'tasks' && (
        <TasksView
          tasks={tasks}
          onToggleTask={handleToggleTask}
          onAddTask={handleAddTask}
          onDeleteTask={handleDeleteTask}
        />
      )}

      {/* 6. Retractable Right Sidebar (Mailbird Side Panel: Calendar/Tasks/Contacts) */}
      <RightSidebar
        isOpen={rightSidebarOpen}
        onClose={() => setRightSidebarOpen(false)}
        events={events}
        contacts={contacts}
        tasks={tasks}
        onToggleTask={handleToggleTask}
        onAddTask={(title, priority) => handleAddTask(title, priority)}
        onSendEmailToContact={handleComposeToContact}
        onAddEvent={(title, time) => handleAddEvent(title, time, 'meeting')}
      />

      {/* Speed Reader Modal */}
      <SpeedReaderModal
        isOpen={speedReaderOpen}
        onClose={() => setSpeedReaderOpen(false)}
        rawText={speedReaderText}
      />

      {/* Floating / Popout Compose Modal */}
      <ComposeModal
        isOpen={composeOpen}
        onClose={() => setComposeOpen(false)}
        accounts={accounts}
        initialDraft={composeInitialDraft}
        onSend={handleSendDraft}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        accounts={accounts}
        onAddAccount={handleAddAccount}
        onDeleteAccount={handleDeleteAccount}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(prev => !prev)}
        accentColor={accentColor}
        onChangeAccentColor={setAccentColor}
        onOpenInstallModal={() => setInstallModalOpen(true)}
        onOpenMessageFilters={() => setMessageFiltersModalOpen(true)}
        onOpenAccountWizard={() => setAccountWizardOpen(true)}
      />

      {/* Snooze (Adiar) Modal */}
      <SnoozeModal
        isOpen={snoozeModalOpen}
        onClose={() => setSnoozeModalOpen(false)}
        onSelectSnooze={handleApplySnooze}
      />

      {/* Install .EXE Guide Modal */}
      <InstallModal
        isOpen={installModalOpen}
        onClose={() => setInstallModalOpen(false)}
      />

      {/* Thunderbird-Style Message Filters Management Modal */}
      <MessageFiltersModal
        isOpen={messageFiltersModalOpen}
        onClose={() => setMessageFiltersModalOpen(false)}
        filters={filters}
        accounts={accounts}
        tags={tags}
        onToggleFilter={handleToggleFilter}
        onDeleteFilter={handleDeleteFilter}
        onMoveFilterUp={handleMoveFilterUp}
        onMoveFilterDown={handleMoveFilterDown}
        onOpenCreateFilter={() => {
          setFilterToEdit(null);
          setFilterEditModalOpen(true);
        }}
        onOpenEditFilter={(filter) => {
          setFilterToEdit(filter);
          setFilterEditModalOpen(true);
        }}
        onRunFiltersNow={handleRunFiltersNow}
      />

      {/* Edit or Create Filter Modal */}
      <FilterEditModal
        isOpen={filterEditModalOpen}
        onClose={() => setFilterEditModalOpen(false)}
        filterToEdit={filterToEdit}
        accounts={accounts}
        tags={tags}
        onSaveFilter={handleSaveFilter}
      />

      {/* Account Wizard Modal (Gmail, Outlook, iCloud, IMAP Integration) */}
      <AccountWizardModal
        isOpen={accountWizardOpen}
        onClose={() => setAccountWizardOpen(false)}
        onAccountConnected={handleAccountConnected}
      />
    </div>
  );
}
