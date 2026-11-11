import React from 'react';
import { 
  Mail, 
  Calendar, 
  Users, 
  CheckSquare, 
  Settings, 
  Sun, 
  Moon, 
  Layers, 
  Download,
  PanelRightClose,
  PanelRightOpen,
  Plus,
  HardDrive,
  FileText
} from 'lucide-react';
import { Account, AppView } from '../types/mail';

interface AppSidebarProps {
  accounts: Account[];
  selectedAccountId: string | null; // null means "Unified Inbox"
  onSelectAccount: (accountId: string | null) => void;
  activeView: AppView;
  onChangeView: (view: AppView) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenSettings: () => void;
  onOpenInstallModal: () => void;
  rightSidebarOpen: boolean;
  onToggleRightSidebar: () => void;
  onOpenAccountWizard: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  accounts,
  selectedAccountId,
  onSelectAccount,
  activeView,
  onChangeView,
  darkMode,
  onToggleDarkMode,
  onOpenSettings,
  onOpenInstallModal,
  rightSidebarOpen,
  onToggleRightSidebar,
  onOpenAccountWizard,
}) => {
  const totalUnreadAll = accounts.reduce((sum, a) => sum + a.unreadCount, 0);

  return (
    <aside 
      className="w-16 flex-shrink-0 bg-slate-900 text-slate-300 flex flex-col items-center py-3 border-r border-slate-800 z-20 select-none"
      aria-label="Barra de Navegação Principal do FlyMail"
    >
      {/* Brand Icon */}
      <div className="mb-4">
        <button
          onClick={() => {
            onChangeView('mail');
            onSelectAccount(null);
          }}
          title="FlyMail - Início"
          className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20 hover:scale-105 active:scale-95 transition-all"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M2.5 19h19a1 1 0 0 0 .8-.4 1 1 0 0 0 .1-.9l-4-9a1 1 0 0 0-.9-.7H9.2l1.3-2.3A1 1 0 0 0 9.7 5H3a1 1 0 0 0-1 1v12a1 1 0 0 0 .5 1zm1.5-2v-4.1l4.9 3.3a1 1 0 0 0 1.1 0L15.3 12l2.2 5H4zm6.6-7h6.6l2.7 6-4.5-3a1 1 0 0 0-1.1 0L9.4 18l-5.4-3.6V7h5.1l-1.4 2.5a1 1 0 0 0 .9.5z" />
          </svg>
        </button>
      </div>

      {/* Account Switcher Section (Unified Inbox + Individual Accounts) */}
      <div className="flex flex-col items-center gap-2 pb-3 mb-2 border-b border-slate-800 w-full px-2">
        {/* Unified Inbox Switcher */}
        <button
          onClick={() => {
            onSelectAccount(null);
            if (activeView !== 'mail') onChangeView('mail');
          }}
          title={`Todas as Caixas (Unificada) - ${totalUnreadAll} não lidos`}
          className={`relative w-10 h-10 rounded-xl flex items-center justify-center text-xs font-semibold transition-all ${
            selectedAccountId === null && activeView === 'mail'
              ? 'bg-sky-500/20 text-sky-400 ring-2 ring-sky-500 ring-offset-2 ring-offset-slate-900 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Layers className="w-5 h-5" />
          {totalUnreadAll > 0 && (
            <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-sky-500 text-[10px] font-bold text-white flex items-center justify-center tabular-nums">
              {totalUnreadAll}
            </span>
          )}
        </button>

        {/* Individual Connected Accounts */}
        {accounts.map((acc) => {
          const isSelected = selectedAccountId === acc.id && activeView === 'mail';
          return (
            <button
              key={acc.id}
              onClick={() => {
                onSelectAccount(acc.id);
                if (activeView !== 'mail') onChangeView('mail');
              }}
              title={`${acc.name} (${acc.email})`}
              className={`relative w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs transition-all ${
                isSelected
                  ? 'ring-2 ring-offset-2 ring-offset-slate-900 scale-105 shadow-md'
                  : 'opacity-70 hover:opacity-100 hover:scale-105'
              }`}
              style={{
                backgroundColor: acc.color,
                color: '#FFFFFF',
                boxShadow: isSelected ? `0 0 12px ${acc.color}66` : undefined,
              }}
            >
              {acc.name.charAt(0).toUpperCase()}
              {acc.unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center tabular-nums border border-slate-900">
                  {acc.unreadCount}
                </span>
              )}
            </button>
          );
        })}

        {/* Add Account Button (+) */}
        <button
          onClick={onOpenAccountWizard}
          title="Conectar Nova Conta (Gmail, Outlook, iCloud, IMAP...)"
          className="w-10 h-10 rounded-xl border border-dashed border-slate-700 hover:border-sky-500 text-slate-400 hover:text-sky-400 hover:bg-slate-800/80 flex items-center justify-center transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Main Mailbird Apps (Mail, Calendar, Contacts, Tasks) */}
      <nav className="flex flex-col items-center gap-1.5 flex-1 w-full px-2" aria-label="Aplicativos integrados">
        <button
          onClick={() => onChangeView('mail')}
          title="Correio Eletrônico (Atalho: M)"
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
            activeView === 'mail'
              ? 'bg-slate-800 text-sky-400'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Mail className="w-5 h-5" />
        </button>

        <button
          onClick={() => onChangeView('calendar')}
          title="Calendário Integrado (Atalho: C)"
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
            activeView === 'calendar'
              ? 'bg-slate-800 text-sky-400'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Calendar className="w-5 h-5" />
        </button>

        <button
          onClick={() => onChangeView('contacts')}
          title="Contatos e Catálogo (Atalho: U)"
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
            activeView === 'contacts'
              ? 'bg-slate-800 text-sky-400'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Users className="w-5 h-5" />
        </button>

        <button
          onClick={() => onChangeView('tasks')}
          title="Tarefas e Lembretes (Atalho: T)"
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
            activeView === 'tasks'
              ? 'bg-slate-800 text-sky-400'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <CheckSquare className="w-5 h-5" />
        </button>

        {/* Google Drive (Visualizar, Editar, Excluir) */}
        <button
          onClick={() => onChangeView('drive')}
          title="Google Drive - Seus Arquivos na Nuvem"
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
            activeView === 'drive'
              ? 'bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/50'
              : 'text-slate-400 hover:text-amber-400 hover:bg-slate-800/60'
          }`}
        >
          <HardDrive className="w-5 h-5" />
        </button>

        {/* Google Docs (Criar e Editar Documentos) */}
        <button
          onClick={() => onChangeView('docs')}
          title="Google Docs - Documentos em Tempo Real"
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
            activeView === 'docs'
              ? 'bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/50'
              : 'text-slate-400 hover:text-blue-400 hover:bg-slate-800/60'
          }`}
        >
          <FileText className="w-5 h-5" />
        </button>
      </nav>

      {/* Bottom Actions: .EXE Info, Toggle Right Sidebar, Dark Mode, Settings */}
      <div className="flex flex-col items-center gap-2 pt-2 border-t border-slate-800 w-full px-2">
        {/* Toggle Right Companion Sidebar */}
        <button
          onClick={onToggleRightSidebar}
          title={rightSidebarOpen ? 'Ocultar Painel Lateral Direito' : 'Mostrar Painel Lateral Direito (Calendário/Notas)'}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
            rightSidebarOpen ? 'text-sky-400 bg-slate-800' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          {rightSidebarOpen ? <PanelRightClose className="w-5 h-5" /> : <PanelRightOpen className="w-5 h-5" />}
        </button>

        {/* Generate .EXE Installer Guide Button */}
        <button
          onClick={onOpenInstallModal}
          title="Empacotar Instalador Desktop (.exe)"
          className="w-10 h-10 rounded-xl flex items-center justify-center text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 hover:text-amber-300 transition-colors"
        >
          <Download className="w-5 h-5" />
        </button>

        {/* Dark/Light Mode Switcher */}
        <button
          onClick={onToggleDarkMode}
          title={darkMode ? 'Mudar para Tema Claro' : 'Mudar para Tema Escuro'}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
        >
          {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-400" />}
        </button>

        {/* Settings Dialog */}
        <button
          onClick={onOpenSettings}
          title="Configurações do FlyMail"
          className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </aside>
  );
};
