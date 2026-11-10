import React, { useState } from 'react';
import {
  X,
  Monitor,
  Download,
  Terminal,
  CheckCircle,
  Copy,
  Layers,
  ShieldCheck,
  Cpu
} from 'lucide-react';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallModal: React.FC<InstallModalProps> = ({ isOpen, onClose }) => {
  const [copiedStep, setCopiedStep] = useState<number | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, stepIndex: number) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(stepIndex);
    setTimeout(() => setCopiedStep(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl text-slate-900 dark:text-slate-100 flex flex-col overflow-hidden max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Como instalar no PC via pacote executável (.exe)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Arquitetura nativa Electron + NSIS pronta para Windows 10 e Windows 11
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

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs select-text">
          {/* Key Advantages Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 space-y-1">
              <div className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 font-semibold">
                <Cpu className="w-4 h-4" />
                <span>Instalador Nativo</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Gera o instalador padrão <code>AeroMail-Setup-1.0.0.exe</code> com assistente de instalação clássico do Windows.
              </p>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                <Layers className="w-4 h-4" />
                <span>System Tray</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Fica minimizado ao lado do relógio do Windows com ícone na bandeja e alertas de novos e-mails.
              </p>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 space-y-1">
              <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Modo Offline</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Acesse e responda e-mails mesmo sem internet; os envios entram em fila sincronizada automaticamente.
              </p>
            </div>
          </div>

          {/* Step by step guide */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Passo a Passo para Gerar o .EXE no seu Computador
            </h4>

            {/* Step 1 */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  1. Baixar o projeto e instalar as dependências
                </span>
                <button
                  onClick={() => copyToClipboard('npm install electron electron-builder --save-dev', 1)}
                  className="flex items-center gap-1 text-[11px] text-sky-600 dark:text-sky-400 hover:underline"
                >
                  {copiedStep === 1 ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedStep === 1 ? 'Copiado!' : 'Copiar comando'}</span>
                </button>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 text-slate-100 font-mono text-[11px] flex items-center justify-between">
                <code>npm install electron electron-builder --save-dev</code>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  2. Gerar o arquivo .exe do AeroMail
                </span>
                <button
                  onClick={() => copyToClipboard('npm run build && npx electron-builder --win nsis', 2)}
                  className="flex items-center gap-1 text-[11px] text-sky-600 dark:text-sky-400 hover:underline"
                >
                  {copiedStep === 2 ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedStep === 2 ? 'Copiado!' : 'Copiar comando'}</span>
                </button>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 text-slate-100 font-mono text-[11px] flex items-center justify-between">
                <code>npm run build && npx electron-builder --win nsis</code>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                O arquivo instalador será criado na pasta <code>dist/AeroMail-Setup-1.0.0.exe</code>. Bastará dar dois cliques para instalar no seu Windows!
              </p>
            </div>

            {/* Step 3 - PWA alternative (instant one-click install) */}
            <div className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 space-y-1.5">
              <div className="font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <Download className="w-4 h-4" />
                <span>Instalação Imediata sem compilação (App de Janela Windows):</span>
              </div>
              <p className="text-[11px] text-amber-900/80 dark:text-amber-200/80 leading-relaxed">
                Você também pode instalar esta aplicação <strong>agora mesmo</strong> no seu PC: no Google Chrome ou Microsoft Edge, clique no ícone de <strong>&quot;Instalar AeroMail&quot;</strong> na barra de endereços (ou Menu &gt; Aplicativos &gt; Instalar este site como aplicativo). Ele abrirá como uma janela de aplicativo dedicada do Windows, com atalho na Área de Trabalho e no Menu Iniciar!
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 flex items-center justify-between select-none">
          <div className="text-[11px] text-slate-400">
            Arquivos de entrada do Electron inclusos: <code>/electron/main.cjs</code> e <code>/electron/preload.cjs</code>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-xs rounded-lg hover:opacity-90 transition-opacity"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
