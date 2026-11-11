import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Server,
  Activity,
  ArrowRight,
  ExternalLink,
  Eye,
  EyeOff,
  Sparkles,
  Mail
} from 'lucide-react';
import { EmailProviderType, Account, AccountConnectionConfig } from '../types/mail';
import { PROVIDER_PRESETS, runConnectionDiagnostics, DiagnosticStage } from '../utils/providerPresets';
import { signInWithGoogle } from '../utils/googleAuth';

interface AccountWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccountConnected: (account: Account) => void;
}

export const AccountWizardModal: React.FC<AccountWizardModalProps> = ({
  isOpen,
  onClose,
  onAccountConnected,
}) => {
  const [step, setStep] = useState<'select-provider' | 'credentials' | 'testing'>('select-provider');
  const [selectedProvider, setSelectedProvider] = useState<EmailProviderType>('google');

  // Form Fields
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [badgeColor, setBadgeColor] = useState(PROVIDER_PRESETS.google.color);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  // Advanced Server Settings
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [incomingHost, setIncomingHost] = useState(PROVIDER_PRESETS.google.defaultIncomingHost);
  const [incomingPort, setIncomingPort] = useState(PROVIDER_PRESETS.google.defaultIncomingPort);
  const [outgoingHost, setOutgoingHost] = useState(PROVIDER_PRESETS.google.defaultOutgoingHost);
  const [outgoingPort, setOutgoingPort] = useState(PROVIDER_PRESETS.google.defaultOutgoingPort);

  // Diagnostics State
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosticStages, setDiagnosticStages] = useState<DiagnosticStage[]>([]);
  const [diagnosticResult, setDiagnosticResult] = useState<{ success: boolean; latencyMs: number } | null>(null);

  if (!isOpen) return null;

  const currentPreset = PROVIDER_PRESETS[selectedProvider];

  const handleGoogleDirectSignIn = async () => {
    setIsGoogleSigningIn(true);
    setGoogleError(null);
    try {
      const res = await signInWithGoogle();
      if (res?.account) {
        onAccountConnected(res.account);
        onClose();
      }
    } catch (err: any) {
      console.error('Falha no login com Google:', err);
      setGoogleError(err.message || 'Erro ao autenticar com o Google.');
    } finally {
      setIsGoogleSigningIn(false);
    }
  };

  const handleSelectProvider = (type: EmailProviderType) => {
    setSelectedProvider(type);
    const preset = PROVIDER_PRESETS[type];
    setBadgeColor(preset.color);
    setIncomingHost(preset.defaultIncomingHost);
    setIncomingPort(preset.defaultIncomingPort);
    setOutgoingHost(preset.defaultOutgoingHost);
    setOutgoingPort(preset.defaultOutgoingPort);
    setDiagnosticResult(null);
    setStep('credentials');
  };

  const handleTestConnection = async () => {
    if (!email.trim()) {
      alert('Por favor, informe seu endereço de e-mail.');
      return;
    }

    setIsDiagnosing(true);
    setDiagnosticResult(null);

    const res = await runConnectionDiagnostics({
      providerType: selectedProvider,
      incomingHost,
      incomingPort,
      outgoingHost,
      outgoingPort,
      username: email,
      passwordOrToken: password,
    });

    setDiagnosticStages(res.stages);
    setDiagnosticResult({ success: res.success, latencyMs: res.totalLatencyMs });
    setIsDiagnosing(false);
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !displayName.trim()) {
      alert('Informe o nome de exibição e o e-mail da conta.');
      return;
    }

    const connectionConfig: AccountConnectionConfig = {
      providerType: selectedProvider,
      incomingHost,
      incomingPort,
      incomingSecurity: currentPreset.defaultIncomingSecurity,
      outgoingHost,
      outgoingPort,
      outgoingSecurity: currentPreset.defaultOutgoingSecurity,
      username: email.trim(),
      passwordOrToken: password,
      isVerified: true,
    };

    const newAccount: Account = {
      id: `acc_${Date.now()}`,
      name: displayName.trim(),
      email: email.trim(),
      color: badgeColor,
      unreadCount: 2, // Mensagens de boas-vindas da sincronização
      provider: selectedProvider,
      connectionConfig,
    };

    onAccountConnected(newAccount);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 animate-in fade-in duration-150 select-none">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl text-slate-900 dark:text-slate-100 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Top Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Adicionar Conta de E-mail
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Conecte caixas postais do Gmail, Outlook, iCloud ou servidores IMAP corporativos
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

        {/* Wizard Steps Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 select-text text-xs">
          {/* STEP 1: Select Provider */}
          {step === 'select-provider' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                  Selecione o Provedor do seu E-mail
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Os protocolos IMAP/SMTP seguros e portas recomendadas serão configurados automaticamente.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Google */}
                <button
                  type="button"
                  onClick={() => handleSelectProvider('google')}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 hover:border-red-500 dark:hover:border-red-500/80 hover:bg-red-50/10 text-left transition-all flex items-start gap-3 group"
                >
                  <div className="w-9 h-9 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center font-bold text-base flex-shrink-0">
                    G
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 dark:text-white group-hover:text-red-600 transition-colors">
                      Google / Gmail
                    </div>
                    <div className="text-[11px] text-slate-400">
                      @gmail.com ou Google Workspace corporativo
                    </div>
                  </div>
                </button>

                {/* Microsoft Outlook */}
                <button
                  type="button"
                  onClick={() => handleSelectProvider('outlook')}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 hover:border-sky-500 dark:hover:border-sky-500/80 hover:bg-sky-50/10 text-left transition-all flex items-start gap-3 group"
                >
                  <div className="w-9 h-9 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-600 flex items-center justify-center font-bold text-base flex-shrink-0">
                    O
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 dark:text-white group-hover:text-sky-600 transition-colors">
                      Microsoft Outlook
                    </div>
                    <div className="text-[11px] text-slate-400">
                      @outlook.com, @hotmail.com, @live.com, M365
                    </div>
                  </div>
                </button>

                {/* Apple iCloud */}
                <button
                  type="button"
                  onClick={() => handleSelectProvider('icloud')}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 hover:border-slate-500 dark:hover:border-slate-400 hover:bg-slate-50/30 text-left transition-all flex items-start gap-3 group"
                >
                  <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white flex items-center justify-center font-bold text-base flex-shrink-0">
                    
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">
                      Apple iCloud
                    </div>
                    <div className="text-[11px] text-slate-400">
                      @icloud.com ou @me.com com senha de app
                    </div>
                  </div>
                </button>

                {/* Yahoo */}
                <button
                  type="button"
                  onClick={() => handleSelectProvider('yahoo')}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 hover:border-purple-500 dark:hover:border-purple-500/80 hover:bg-purple-50/10 text-left transition-all flex items-start gap-3 group"
                >
                  <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center font-bold text-base flex-shrink-0">
                    Y!
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 dark:text-white group-hover:text-purple-600 transition-colors">
                      Yahoo! Mail
                    </div>
                    <div className="text-[11px] text-slate-400">
                      @yahoo.com ou @yahoo.com.br
                    </div>
                  </div>
                </button>

                {/* Generic IMAP */}
                <button
                  type="button"
                  onClick={() => handleSelectProvider('imap')}
                  className="sm:col-span-2 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 hover:border-indigo-500 hover:bg-indigo-50/10 text-left transition-all flex items-start gap-3 group"
                >
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center font-bold text-base flex-shrink-0">
                    <Server className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                      Outro Provedor IMAP / SMTP Personalizado
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Servidor corporativo próprio, cPanel, Locaweb, Hostgator, Proton Bridge, etc.
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Credentials & Test Connection */}
          {step === 'credentials' && (
            <form onSubmit={handleSaveAccount} className="space-y-5">
              {/* Top Provider Bar */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-3.5 h-3.5 rounded-full"
                    style={{ backgroundColor: currentPreset.color }}
                  />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {currentPreset.title}
                    </span>
                    <span className="text-[11px] text-slate-400 ml-2">
                      ({currentPreset.defaultIncomingHost}:993)
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStep('select-provider')}
                  className="text-xs text-sky-600 dark:text-sky-400 hover:underline font-semibold"
                >
                  Trocar Provedor
                </button>
              </div>

              {/* Google 1-Click Login Highlight */}
              {selectedProvider === 'google' && (
                <div className="p-4 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-red-600 dark:text-red-400" />
                      <span className="font-bold text-red-900 dark:text-red-200 text-xs">
                        Login com 1 Clique (Recomendado - Segurança Máxima)
                      </span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 font-mono">
                      OAuth 2.0
                    </span>
                  </div>
                  <p className="text-[11px] text-red-800/80 dark:text-red-300/80">
                    Conecte sua conta do Google com apenas um clique pelo navegador oficial. Você não precisa gerar senhas de aplicativo nem expor senhas no app.
                  </p>
                  <button
                    type="button"
                    onClick={handleGoogleDirectSignIn}
                    disabled={isGoogleSigningIn}
                    className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-white font-semibold text-xs shadow-xs transition-all active:scale-[0.99] cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                    </svg>
                    <span>{isGoogleSigningIn ? 'Conectando ao Google...' : 'Entrar com o Google em 1 Clique'}</span>
                  </button>
                  {googleError && (
                    <div className="text-[11px] text-red-500 font-medium">
                      {googleError}
                    </div>
                  )}
                </div>
              )}

              {/* Password Guide Box (Official App-Password Instructions for other providers or fallback) */}
              {selectedProvider !== 'google' && (
                <div className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 text-slate-700 dark:text-slate-300 space-y-2">
                  <div className="flex items-center justify-between font-bold text-amber-800 dark:text-amber-300">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-amber-500" />
                      {currentPreset.passwordGuide.title}
                    </span>
                    {currentPreset.passwordGuide.officialUrl !== '#' && (
                      <a
                        href={currentPreset.passwordGuide.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-amber-700 dark:text-amber-400 underline flex items-center gap-1"
                      >
                        <span>Abrir portal oficial</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <p className="text-[11px] text-amber-900/80 dark:text-amber-200/80">
                    {currentPreset.passwordGuide.description}
                  </p>
                  <ol className="list-decimal list-inside space-y-0.5 text-[11px] text-slate-600 dark:text-slate-400">
                    {currentPreset.passwordGuide.steps.map((st, i) => (
                      <li key={i}>{st}</li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Main Credentials Inputs */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Seu Nome / Nome de Exibição:
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Ex: Hugo Baltazar (iCloud)"
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Endereço de E-mail:
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={`usuario@${selectedProvider === 'icloud' ? 'icloud.com' : selectedProvider === 'outlook' ? 'outlook.com' : 'gmail.com'}`}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Senha de Aplicativo ou Token:
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••••••"
                        className="w-full pl-3 pr-9 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-sky-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Cor do Distintivo da Conta:
                    </label>
                    <div className="flex items-center gap-2 pt-1">
                      {['#EA4335', '#0078D4', '#1C1C1E', '#6001D2', '#10B981', '#F59E0B'].map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setBadgeColor(c)}
                          className="w-6 h-6 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center transition-transform hover:scale-110"
                          style={{ backgroundColor: c }}
                        >
                          {badgeColor === c && <span className="w-2 h-2 rounded-full bg-white" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Advanced Server Settings Accordion */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-slate-400" />
                    Parâmetros Avançados de Servidor (IMAP/SMTP)
                  </span>
                  {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showAdvanced && (
                  <div className="p-4 bg-white dark:bg-slate-900 space-y-3 border-t border-slate-200 dark:border-slate-800 text-xs">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <label className="block text-[10px] text-slate-400 mb-0.5">Servidor de Entrada (IMAP):</label>
                        <input
                          type="text"
                          value={incomingHost}
                          onChange={(e) => setIncomingHost(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded font-mono text-[11px]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-0.5">Porta IMAP:</label>
                        <input
                          type="number"
                          value={incomingPort}
                          onChange={(e) => setIncomingPort(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded font-mono text-[11px]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <label className="block text-[10px] text-slate-400 mb-0.5">Servidor de Saída (SMTP):</label>
                        <input
                          type="text"
                          value={outgoingHost}
                          onChange={(e) => setOutgoingHost(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded font-mono text-[11px]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-0.5">Porta SMTP:</label>
                        <input
                          type="number"
                          value={outgoingPort}
                          onChange={(e) => setOutgoingPort(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded font-mono text-[11px]"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Test Diagnostics Box */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-emerald-500" />
                      Diagnóstico de Conectividade em Tempo Real
                    </h5>
                    <p className="text-[11px] text-slate-400">
                      Valida DNS, handshake TLS 993, autenticação e canal de envio SMTP.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isDiagnosing}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50 transition-colors shadow-xs"
                  >
                    {isDiagnosing ? (
                      <>
                        <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        <span>Testando...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Testar Conexão</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Diagnostic stages checklist */}
                {diagnosticStages.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                    {diagnosticStages.map((st) => (
                      <div key={st.id} className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-2">
                          {st.status === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                          {st.status === 'running' && (
                            <span className="w-3.5 h-3.5 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
                          )}
                          {st.status === 'pending' && <span className="w-3.5 h-3.5 rounded-full border border-slate-400" />}
                          <span className={st.status === 'success' ? 'font-semibold text-slate-800 dark:text-slate-200' : 'text-slate-500'}>
                            {st.name}
                          </span>
                        </div>
                        {st.latencyMs && (
                          <span className="font-mono text-[10px] text-slate-400 tabular-nums">
                            {st.latencyMs}ms
                          </span>
                        )}
                      </div>
                    ))}

                    {diagnosticResult?.success && (
                      <div className="mt-2 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>Conexão validada com sucesso! Latência total: {diagnosticResult.latencyMs}ms.</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors font-medium"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <span>Salvar e Conectar Conta</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
