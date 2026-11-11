import React, { useState } from 'react';
import {
  Mail,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Layers,
  Zap,
  SlidersHorizontal,
  Plus,
  Loader2,
  Globe
} from 'lucide-react';
import { signInWithGoogle } from '../utils/googleAuth';
import { Account } from '../types/mail';

interface WelcomeOnboardingProps {
  onAccountAdded: (account: Account) => void;
  onOpenManualWizard: () => void;
}

export const WelcomeOnboarding: React.FC<WelcomeOnboardingProps> = ({
  onAccountAdded,
  onOpenManualWizard,
}) => {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setErrorMessage(null);
    try {
      const result = await signInWithGoogle();
      if (result?.account) {
        onAccountAdded(result.account);
      }
    } catch (err: any) {
      console.error('Falha no login Google:', err);
      let msg = 'Não foi possível completar o login com o Google.';
      
      if (err.code === 'auth/popup-closed-by-user') {
        msg = 'A janela de login do Google foi fechada antes da confirmação. Clique novamente para autorizar.';
      } else if (err.code === 'auth/popup-blocked') {
        msg = 'O popup de login foi bloqueado pelo sistema. Permita janelas pop-up ou utilize a configuração manual abaixo.';
      } else if (err.code === 'auth/unauthorized-domain') {
        msg = 'Domínio de execução em validação de segurança. Você pode conectar instantaneamente usando a configuração manual abaixo.';
      } else if (err.message) {
        msg = err.message;
      }
      
      setErrorMessage(msg);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 p-6 select-none relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-2xl bg-slate-900/90 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-xl relative z-10 animate-in fade-in zoom-in-95 duration-200 text-slate-100">
        {/* App Header Badge */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/25">
            <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
              <path d="M2.5 19h19a1 1 0 0 0 .8-.4 1 1 0 0 0 .1-.9l-4-9a1 1 0 0 0-.9-.7H9.2l1.3-2.3A1 1 0 0 0 9.7 5H3a1 1 0 0 0-1 1v12a1 1 0 0 0 .5 1zm1.5-2v-4.1l4.9 3.3a1 1 0 0 0 1.1 0L15.3 12l2.2 5H4zm6.6-7h6.6l2.7 6-4.5-3a1 1 0 0 0-1.1 0L9.4 18l-5.4-3.6V7h5.1l-1.4 2.5a1 1 0 0 0 .9.5z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-white font-sans">
                FlyMail
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 text-[11px] font-bold border border-sky-500/30">
                Desktop & Web
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Cliente de e-mail rápido, modular e seguro para máxima produtividade.
            </p>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-800/80">
            <div className="flex items-center gap-2 text-sky-400 font-semibold text-xs mb-1">
              <Layers className="w-4 h-4" />
              <span>Caixa Unificada</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Junte Gmail, Outlook e iCloud no mesmo painel com identificação por cores.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-800/80">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs mb-1">
              <Zap className="w-4 h-4" />
              <span>Speed Reader</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Leitura RSVP acelerada com destaque visual na letra central da palavra.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-800/80">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs mb-1">
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filtros Thunderbird</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Regras automáticas com condições flexíveis e ações múltiplas.
            </p>
          </div>
        </div>

        {/* Main CTA: 1-Click Google Sign In */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900 border border-slate-700/80 shadow-inner mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <h2 className="text-sm font-bold text-white">
                Comece conectando sua primeira conta
              </h2>
            </div>
            <span className="text-[11px] text-emerald-400 font-mono font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Segurança Máxima
            </span>
          </div>

          <p className="text-xs text-slate-300 mb-5 leading-relaxed">
            Faça login diretamente pelo Google oficial. Suas credenciais permanecem protegidas pelo protocolo OAuth 2.0 sem armazenamento de senhas locais no aplicativo.
          </p>

          {/* Official styled Google Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-900 font-semibold text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed group cursor-pointer"
          >
            {isGoogleLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-slate-600" />
                <span>Autenticando com o Google...</span>
              </>
            ) : (
              <>
                {/* Official SVG Google 4-Color Logo */}
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                <span>Entrar diretamente com o Google</span>
                <ArrowRight className="w-4 h-4 ml-auto text-slate-400 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          {errorMessage && (
            <div className="mt-3 p-3 rounded-lg bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-start gap-2">
              <span className="text-red-400 mt-0.5">•</span>
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Alternative Providers / Manual Setup */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <div className="text-xs text-slate-400">
            Deseja conectar outro provedor de e-mail?
          </div>
          <button
            type="button"
            onClick={onOpenManualWizard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-sky-400 hover:text-sky-300 hover:bg-slate-800/80 transition-colors"
          >
            <span>Configurar Outlook, iCloud ou IMAP</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
