import React, { useState } from 'react';
import {
  Reply,
  ReplyAll,
  Forward,
  Trash2,
  Archive,
  Star,
  Clock,
  Printer,
  Zap,
  Paperclip,
  Download,
  Send,
  MoreVertical,
  CheckCircle,
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  FileArchive
} from 'lucide-react';
import { EmailThread, Account, EmailTag, EmailAttachment } from '../types/mail';

interface EmailViewerProps {
  thread: EmailThread | null;
  accounts: Account[];
  tags: EmailTag[];
  onToggleStar: (threadId: string) => void;
  onArchive: (threadId: string) => void;
  onTrash: (threadId: string) => void;
  onSnooze: (threadId: string) => void;
  onLaunchSpeedReader: (text: string) => void;
  onQuickReply: (threadId: string, replyText: string) => void;
  onForward: (thread: EmailThread) => void;
}

export const EmailViewer: React.FC<EmailViewerProps> = ({
  thread,
  accounts,
  tags,
  onToggleStar,
  onArchive,
  onTrash,
  onSnooze,
  onLaunchSpeedReader,
  onQuickReply,
  onForward,
}) => {
  const [quickReplyText, setQuickReplyText] = useState('');
  const [showReplySentAlert, setShowReplySentAlert] = useState(false);
  const [expandedMessageIds, setExpandedMessageIds] = useState<Record<string, boolean>>({});

  if (!thread) {
    return (
      <div className="flex-1 bg-white dark:bg-slate-950 flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 p-8 select-none">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center mb-3">
          <FileText className="w-8 h-8 text-slate-300 dark:text-slate-700" />
        </div>
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Nenhuma conversa selecionada
        </h3>
        <p className="text-xs max-w-sm text-center">
          Selecione um e-mail na lista ao lado para ler seu conteúdo, usar o Speed Reader ou responder.
        </p>
      </div>
    );
  }

  const accountMap = new Map<string, Account>(accounts.map(a => [a.id, a]));
  const tagMap = new Map<string, EmailTag>(tags.map(t => [t.id, t]));
  const account = accountMap.get(thread.accountId);

  // Concatenate thread text for the Speed Reader
  const allThreadText = thread.messages
    .map(m => `De: ${m.from.name}.\nAssunto: ${m.subject}.\n${m.bodyText}`)
    .join('\n\n---\n\n');

  const handleSendQuickReply = () => {
    if (!quickReplyText.trim()) return;
    onQuickReply(thread.id, quickReplyText);
    setQuickReplyText('');
    setShowReplySentAlert(true);
    setTimeout(() => setShowReplySentAlert(false), 3000);
  };

  const getAttachmentIcon = (type: EmailAttachment['type']) => {
    switch (type) {
      case 'pdf': return <FileText className="w-4 h-4 text-red-500" />;
      case 'image': return <ImageIcon className="w-4 h-4 text-blue-500" />;
      case 'sheet': return <FileSpreadsheet className="w-4 h-4 text-emerald-500" />;
      case 'archive': return <FileArchive className="w-4 h-4 text-amber-500" />;
      default: return <Paperclip className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="flex-1 bg-white dark:bg-slate-950 flex flex-col h-full overflow-hidden select-text">
      {/* Top Toolbar */}
      <div className="h-14 px-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between select-none bg-white dark:bg-slate-950">
        <div className="flex items-center gap-1">
          {/* Speed Reader Button (Mailbird's signature fast-reading tool) */}
          <button
            onClick={() => onLaunchSpeedReader(allThreadText)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium text-xs rounded-md shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
            title="Abrir Speed Reader para ler esta conversa em alta velocidade"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Speed Reader</span>
          </button>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-2" />

          {/* Standard Mail Actions */}
          <button
            onClick={() => onToggleStar(thread.id)}
            title={thread.isStarred ? 'Remover estrela' : 'Adicionar estrela'}
            className={`p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
              thread.isStarred ? 'text-amber-500' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Star className="w-4 h-4 fill-current" />
          </button>

          <button
            onClick={() => onSnooze(thread.id)}
            title="Adiar (Snooze)"
            className="p-2 rounded-md text-slate-500 hover:text-indigo-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Clock className="w-4 h-4" />
          </button>

          <button
            onClick={() => onArchive(thread.id)}
            title="Arquivar conversa"
            className="p-2 rounded-md text-slate-500 hover:text-emerald-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Archive className="w-4 h-4" />
          </button>

          <button
            onClick={() => onTrash(thread.id)}
            title="Excluir mensagem"
            className="p-2 rounded-md text-slate-500 hover:text-red-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => window.print()}
            title="Imprimir e-mail"
            className="p-2 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>

        {/* Account Tag Indicator */}
        {account && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: account.color }}
            />
            <span className="font-medium truncate">{account.email}</span>
          </div>
        )}
      </div>

      {/* Main Reading Scroll Area */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
        {/* Subject Header */}
        <div className="space-y-2 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
              {thread.subject}
            </h1>
          </div>

          {/* Tags */}
          {thread.tags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {thread.tags.map((tagId) => {
                const tag = tagMap.get(tagId);
                if (!tag) return null;
                return (
                  <span
                    key={tag.id}
                    className={`text-xs px-2 py-0.5 rounded-md font-medium ${tag.badgeBg} ${tag.badgeText}`}
                  >
                    {tag.name}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Messages in the Thread */}
        <div className="space-y-4">
          {thread.messages.map((msg, index) => {
            const isLastMessage = index === thread.messages.length - 1;
            const isExpanded = expandedMessageIds[msg.id] ?? isLastMessage;

            return (
              <div
                key={msg.id}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-xs overflow-hidden transition-all"
              >
                {/* Message Header */}
                <div
                  onClick={() => {
                    if (!isLastMessage) {
                      setExpandedMessageIds(prev => ({ ...prev, [msg.id]: !isExpanded }));
                    }
                  }}
                  className={`p-4 flex items-center justify-between cursor-pointer select-none ${
                    !isLastMessage ? 'hover:bg-slate-50 dark:hover:bg-slate-800/50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center justify-center flex-shrink-0">
                      {msg.from.name.charAt(0)}
                    </div>

                    {/* Sender Details */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                          {msg.from.name}
                        </span>
                        <span className="text-[11px] text-slate-400 truncate">
                          &lt;{msg.from.email}&gt;
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        para {msg.to.map(t => t.name).join(', ')}
                      </div>
                    </div>
                  </div>

                  {/* Date & Actions */}
                  <div className="flex items-center gap-2 text-xs text-slate-400 flex-shrink-0">
                    <span className="tabular-nums">{msg.date}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onForward(thread);
                      }}
                      title="Encaminhar"
                      className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200"
                    >
                      <Forward className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Message Body (Rendered when expanded) */}
                {isExpanded && (
                  <div className="px-4 pb-5 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line py-2">
                      {msg.bodyText}
                    </div>

                    {/* Attachments Section */}
                    {msg.attachments.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                          <Paperclip className="w-3.5 h-3.5" />
                          <span>Anexos ({msg.attachments.length})</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {msg.attachments.map((att) => (
                            <div
                              key={att.id}
                              className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900 hover:border-sky-300 dark:hover:border-sky-700 transition-colors"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                {getAttachmentIcon(att.type)}
                                <div className="min-w-0">
                                  <div className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                                    {att.name}
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-mono">
                                    {att.size}
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={() => alert(`Simulação: Download do arquivo '${att.name}' concluído com sucesso!`)}
                                className="p-1 rounded text-slate-400 hover:text-sky-600 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                                title="Baixar anexo"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Reply Box (Mailbird embedded reply style) */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Reply className="w-3.5 h-3.5 text-sky-500" />
              Resposta rápida para {thread.participants[0]?.name}
            </span>
            {showReplySentAlert && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Resposta enviada!
              </span>
            )}
          </div>

          <textarea
            value={quickReplyText}
            onChange={(e) => setQuickReplyText(e.target.value)}
            placeholder="Digite sua resposta rápida aqui (ou abra o compositor completo)..."
            rows={3}
            className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 transition-all resize-y"
          />

          <div className="flex items-center justify-between">
            <div className="text-[11px] text-slate-400">
              Pressione Enter para pular linha. Use &quot;Enviar&quot; para despachar.
            </div>
            <button
              onClick={handleSendQuickReply}
              disabled={!quickReplyText.trim()}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-xs rounded-lg shadow-xs transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Enviar Resposta</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
