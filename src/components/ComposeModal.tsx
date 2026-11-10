import React, { useState } from 'react';
import {
  X,
  Minus,
  Maximize2,
  Minimize2,
  Paperclip,
  Send,
  Trash2,
  Clock,
  Bold,
  Italic,
  Underline,
  List,
  Link as LinkIcon,
  ChevronDown
} from 'lucide-react';
import { Account, ComposeDraft, EmailAttachment } from '../types/mail';

interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  initialDraft?: Partial<ComposeDraft>;
  onSend: (draft: ComposeDraft) => void;
}

export const ComposeModal: React.FC<ComposeModalProps> = ({
  isOpen,
  onClose,
  accounts,
  initialDraft,
  onSend,
}) => {
  const [selectedAccountId, setSelectedAccountId] = useState(
    initialDraft?.fromAccountId || accounts[0]?.id || ''
  );
  const [to, setTo] = useState(initialDraft?.to || '');
  const [cc, setCc] = useState(initialDraft?.cc || '');
  const [bcc, setBcc] = useState(initialDraft?.bcc || '');
  const [showCc, setShowCc] = useState(Boolean(initialDraft?.cc));
  const [showBcc, setShowBcc] = useState(Boolean(initialDraft?.bcc));
  const [subject, setSubject] = useState(initialDraft?.subject || '');
  const [body, setBody] = useState(initialDraft?.body || '');
  const [attachments, setAttachments] = useState<EmailAttachment[]>(initialDraft?.attachments || []);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  if (!isOpen) return null;

  const currentAccount = accounts.find(a => a.id === selectedAccountId) || accounts[0];

  const handleSimulateAddAttachment = () => {
    const fakeAttachment: EmailAttachment = {
      id: `att_${Date.now()}`,
      name: `Documento_Anexo_${Math.floor(Math.random() * 900 + 100)}.pdf`,
      size: `${(Math.random() * 3 + 0.5).toFixed(1)} MB`,
      type: 'pdf',
    };
    setAttachments(prev => [...prev, fakeAttachment]);
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!to.trim()) {
      alert('Por favor, informe ao menos um destinatário no campo "Para".');
      return;
    }

    onSend({
      fromAccountId: selectedAccountId,
      to,
      cc,
      bcc,
      subject: subject.trim() || '(Sem assunto)',
      body,
      attachments,
    });

    onClose();
  };

  // Minimized tray bar in the bottom right corner
  if (isMinimized) {
    return (
      <div className="fixed bottom-0 right-6 w-72 bg-slate-900 border border-slate-700 rounded-t-xl shadow-xl z-50 flex items-center justify-between px-4 py-2.5 text-white select-none">
        <span className="text-xs font-semibold truncate">
          {subject || 'Nova Mensagem'}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(false)}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed z-50 transition-all ${
      isMaximized 
        ? 'inset-4 flex flex-col' 
        : 'bottom-4 right-6 w-full max-w-2xl h-[580px] flex flex-col'
    }`}>
      <div className="w-full h-full bg-white dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden select-text">
        {/* Modal Window Title Bar */}
        <div className="px-4 py-2.5 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between select-none">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            {subject ? `Rascunho: ${subject}` : 'Nova Mensagem'}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800"
              title="Minimizar"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsMaximized(!isMaximized)}
              className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800"
              title={isMaximized ? 'Restaurar tamanho' : 'Maximizar'}
            >
              {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-slate-200 dark:hover:bg-slate-800"
              title="Fechar e salvar rascunho"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          {/* Header Rows (From, To, Subject) */}
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 space-y-2 text-xs">
            {/* Account Selector (From) */}
            <div className="flex items-center gap-2">
              <span className="w-12 text-slate-400 font-medium">De:</span>
              <div className="relative flex-1">
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2.5 py-1 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-sky-500 appearance-none font-medium cursor-pointer"
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} &lt;{acc.email}&gt;
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Recipients (To) */}
            <div className="flex items-center gap-2">
              <span className="w-12 text-slate-400 font-medium">Para:</span>
              <input
                type="email"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="destinatario@exemplo.com"
                className="flex-1 bg-transparent border-b border-transparent focus:border-sky-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none py-1"
                required
              />
              <div className="flex items-center gap-1.5 text-slate-400">
                {!showCc && (
                  <button
                    type="button"
                    onClick={() => setShowCc(true)}
                    className="hover:text-sky-500 font-medium text-[11px]"
                  >
                    Cc
                  </button>
                )}
                {!showBcc && (
                  <button
                    type="button"
                    onClick={() => setShowBcc(true)}
                    className="hover:text-sky-500 font-medium text-[11px]"
                  >
                    Cco
                  </button>
                )}
              </div>
            </div>

            {/* Cc (Optional) */}
            {showCc && (
              <div className="flex items-center gap-2">
                <span className="w-12 text-slate-400 font-medium">Cc:</span>
                <input
                  type="text"
                  value={cc}
                  onChange={(e) => setCc(e.target.value)}
                  placeholder="copia@exemplo.com"
                  className="flex-1 bg-transparent border-b border-transparent focus:border-sky-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none py-0.5"
                />
              </div>
            )}

            {/* Bcc (Optional) */}
            {showBcc && (
              <div className="flex items-center gap-2">
                <span className="w-12 text-slate-400 font-medium">Cco:</span>
                <input
                  type="text"
                  value={bcc}
                  onChange={(e) => setBcc(e.target.value)}
                  placeholder="copia.oculta@exemplo.com"
                  className="flex-1 bg-transparent border-b border-transparent focus:border-sky-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none py-0.5"
                />
              </div>
            )}

            {/* Subject */}
            <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/60">
              <span className="w-12 text-slate-400 font-medium">Assunto:</span>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Assunto da mensagem"
                className="flex-1 bg-transparent font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none py-1"
              />
            </div>
          </div>

          {/* Attachments Chip list */}
          {attachments.length > 0 && (
            <div className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 flex-wrap">
              {attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center gap-1.5 px-2 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
                >
                  <Paperclip className="w-3 h-3 text-slate-400" />
                  <span className="truncate max-w-[140px]">{att.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">({att.size})</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAttachment(att.id)}
                    className="p-0.5 text-slate-400 hover:text-red-500 rounded"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Text Editor Area */}
          <div className="flex-1 p-3 flex flex-col min-h-0">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Escreva sua mensagem aqui..."
              className="flex-1 w-full p-2 text-xs bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Formatting & Bottom Actions Bar */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950 flex items-center justify-between select-none">
            {/* Rich text formatting tools */}
            <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
              <button
                type="button"
                onClick={handleSimulateAddAttachment}
                className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                title="Anexar arquivos"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />
              <button
                type="button"
                onClick={() => setBody(prev => prev + ' **texto negrito** ')}
                className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                title="Negrito"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setBody(prev => prev + ' *texto itálico* ')}
                className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                title="Itálico"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setBody(prev => prev + ' <u>texto sublinhado</u> ')}
                className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                title="Sublinhado"
              >
                <Underline className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setBody(prev => prev + '\n- Item 1\n- Item 2\n')}
                className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                title="Lista"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Send & Discard Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded text-slate-400 hover:text-red-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                title="Descartar rascunho"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-medium text-xs rounded-lg shadow-sm transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enviar</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
