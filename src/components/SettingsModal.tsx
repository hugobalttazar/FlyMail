import React, { useState } from 'react';
import {
  X,
  User,
  Palette,
  Keyboard,
  Shield,
  Plus,
  Trash2,
  Check,
  Laptop,
  SlidersHorizontal
} from 'lucide-react';
import { Account, ThemeAccent } from '../types/mail';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  onAddAccount: (name: string, email: string, color: string) => void;
  onDeleteAccount: (accountId: string) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  accentColor: ThemeAccent;
  onChangeAccentColor: (accent: ThemeAccent) => void;
  onOpenInstallModal: () => void;
  onOpenMessageFilters: () => void;
  onOpenAccountWizard: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  accounts,
  onAddAccount,
  onDeleteAccount,
  darkMode,
  onToggleDarkMode,
  accentColor,
  onChangeAccentColor,
  onOpenInstallModal,
  onOpenMessageFilters,
  onOpenAccountWizard,
}) => {
  const [activeTab, setActiveTab] = useState<'accounts' | 'appearance' | 'shortcuts' | 'about'>('accounts');
  const [newAccName, setNewAccName] = useState('');
  const [newAccEmail, setNewAccEmail] = useState('');
  const [newAccColor, setNewAccColor] = useState('#3B82F6');
  const [showAddForm, setShowAddForm] = useState(false);

  if (!isOpen) return null;

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccEmail.trim() || !newAccName.trim()) return;
    onAddAccount(newAccName.trim(), newAccEmail.trim(), newAccColor);
    setNewAccName('');
    setNewAccEmail('');
    setShowAddForm(false);
  };

  const accents: { id: ThemeAccent; name: string; color: string }[] = [
    { id: 'blue', name: 'Azul Céu (Mailbird)', color: '#0284C7' },
    { id: 'indigo', name: 'Índigo Moderno', color: '#4F46E5' },
    { id: 'violet', name: 'Violeta Elétrico', color: '#7C3AED' },
    { id: 'emerald', name: 'Esmeralda', color: '#059669' },
    { id: 'amber', name: 'Âmbar Dourado', color: '#D97706' },
    { id: 'rose', name: 'Rosa Magenta', color: '#E11D48' },
  ];

  const shortcuts = [
    { key: 'C', description: 'Escrever novo e-mail (Compose)' },
    { key: '/', description: 'Focar na barra de pesquisa' },
    { key: 'E', description: 'Arquivar conversa selecionada' },
    { key: '# ou Del', description: 'Mover para a Lixeira' },
    { key: 'S', description: 'Marcar / desmarcar com estrela' },
    { key: 'U', description: 'Marcar como não lido / lido' },
    { key: 'Espaço', description: 'Iniciar / pausar o Speed Reader' },
    { key: 'Esc', description: 'Fechar janelas modais' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl text-slate-900 dark:text-slate-100 flex flex-col h-[580px] overflow-hidden">
        {/* Top Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Configurações do FlyMail
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Layout: Sidebar Tabs + Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Settings Left Tab Menu */}
          <div className="w-48 bg-slate-50 dark:bg-slate-950/60 border-r border-slate-100 dark:border-slate-800 p-2 space-y-1">
            <button
              onClick={() => setActiveTab('accounts')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                activeTab === 'accounts'
                  ? 'bg-sky-500 text-white font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Contas Conectadas</span>
            </button>

            <button
              onClick={() => setActiveTab('appearance')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                activeTab === 'appearance'
                  ? 'bg-sky-500 text-white font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>Aparência & Tema</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenMessageFilters();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/60 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filtros & Regras (Thunderbird)</span>
            </button>

            <button
              onClick={() => setActiveTab('shortcuts')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                activeTab === 'shortcuts'
                  ? 'bg-sky-500 text-white font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <Keyboard className="w-4 h-4" />
              <span>Atalhos de Teclado</span>
            </button>

            <button
              onClick={() => setActiveTab('about')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                activeTab === 'about'
                  ? 'bg-sky-500 text-white font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Sobre & Pacote .EXE</span>
            </button>
          </div>

          {/* Settings Right Pane */}
          <div className="flex-1 p-6 overflow-y-auto select-text">
            {/* Tab: Accounts */}
            {activeTab === 'accounts' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Contas de E-mail
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Gerencie suas contas sincronizadas na Caixa Unificada.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAccountWizard();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Conectar Provedor (Gmail, Outlook, iCloud...)</span>
                  </button>
                </div>

                {showAddForm && (
                  <form onSubmit={handleCreateAccount} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 space-y-3">
                    <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Conectar Nova Conta
                    </h5>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-500 mb-1">Nome de Exibição:</label>
                        <input
                          type="text"
                          value={newAccName}
                          onChange={(e) => setNewAccName(e.target.value)}
                          placeholder="Ex: Hugo Empresa"
                          className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-500 mb-1">Endereço de E-mail:</label>
                        <input
                          type="email"
                          value={newAccEmail}
                          onChange={(e) => setNewAccEmail(e.target.value)}
                          placeholder="nome@dominio.com"
                          className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">Cor do Distintivo da Conta:</label>
                      <div className="flex items-center gap-2">
                        {['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899'].map((c) => (
                          <button
                            type="button"
                            key={c}
                            onClick={() => setNewAccColor(c)}
                            className="w-6 h-6 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                            style={{ backgroundColor: c }}
                          >
                            {newAccColor === c && <Check className="w-3 h-3 text-white stroke-3" />}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddForm(false)}
                        className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 text-xs font-medium bg-sky-600 hover:bg-sky-500 text-white rounded-lg"
                      >
                        Salvar Conta
                      </button>
                    </div>
                  </form>
                )}

                <div className="space-y-2">
                  {accounts.length === 0 ? (
                    <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                      <p className="text-xs text-slate-400 mb-2">Nenhuma conta conectada no momento.</p>
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenAccountWizard();
                        }}
                        className="text-xs font-semibold text-sky-500 hover:underline"
                      >
                        Conectar sua primeira conta agora
                      </button>
                    </div>
                  ) : (
                    accounts.map((acc) => (
                      <div
                        key={acc.id}
                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="w-4 h-4 rounded-full flex-shrink-0"
                            style={{ backgroundColor: acc.color }}
                          />
                          <div>
                            <div className="text-xs font-semibold text-slate-900 dark:text-white">
                              {acc.name}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              {acc.email}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                            {acc.provider.toUpperCase()}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Tem certeza que deseja excluir a conta "${acc.name}" (${acc.email}) do FlyMail? Todas as mensagens sincronizadas desta conta serão removidas deste dispositivo.`)) {
                                onDeleteAccount(acc.id);
                              }
                            }}
                            title="Excluir conta do FlyMail"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Tab: Appearance */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                    Tema da Interface
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                    Alterne entre a estética clara e escura inspirada no Mailbird.
                  </p>
                  <div className="grid grid-cols-2 gap-3 max-w-sm">
                    <button
                      onClick={() => {
                        if (darkMode) onToggleDarkMode();
                      }}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between ${
                        !darkMode
                          ? 'border-sky-500 ring-2 ring-sky-500/20 bg-sky-50/20'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold">Tema Claro</div>
                        <div className="text-[11px] text-slate-400">Suave e nítido</div>
                      </div>
                      {!darkMode && <Check className="w-4 h-4 text-sky-500" />}
                    </button>

                    <button
                      onClick={() => {
                        if (!darkMode) onToggleDarkMode();
                      }}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between ${
                        darkMode
                          ? 'border-sky-500 ring-2 ring-sky-500/20 bg-sky-950/20'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold">Tema Escuro</div>
                        <div className="text-[11px] text-slate-400">Contraste profundo</div>
                      </div>
                      {darkMode && <Check className="w-4 h-4 text-sky-500" />}
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                    Cor de Destaque (Accent Color)
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                    Personalize os tons de botões principais e indicadores de foco.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {accents.map((acc) => (
                      <button
                        key={acc.id}
                        onClick={() => onChangeAccentColor(acc.id)}
                        className={`p-2.5 rounded-lg border text-xs flex items-center gap-2.5 transition-colors ${
                          accentColor === acc.id
                            ? 'border-slate-900 dark:border-white font-semibold'
                            : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: acc.color }} />
                        <span>{acc.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Shortcuts */}
            {activeTab === 'shortcuts' && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Atalhos de Produtividade
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Navegue rapidamente sem tirar as mãos do teclado.
                  </p>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {shortcuts.map((sc) => (
                    <div key={sc.key} className="py-2.5 flex items-center justify-between text-xs">
                      <span className="text-slate-700 dark:text-slate-300">{sc.description}</span>
                      <kbd className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                        {sc.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: About & .EXE Status */}
            {activeTab === 'about' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-sky-200 dark:border-sky-900/50 bg-sky-50/50 dark:bg-sky-950/20 space-y-2">
                  <div className="flex items-center gap-2 text-sky-700 dark:text-sky-300 font-bold text-xs">
                    <Laptop className="w-4 h-4" />
                    <span>FlyMail v1.0.0 (Desktop Ready)</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Arquitetura profissional full-stack inspirada na agilidade do Mailbird, sem violação de direitos autorais ou código proprietário. Totalmente preparada para empacotamento desktop nativo do Windows em pacote <code>.exe</code> via Electron com instalador NSIS.
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenInstallModal();
                    }}
                    className="mt-2 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
                  >
                    <span>Ver Instruções do Pacote .EXE</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
