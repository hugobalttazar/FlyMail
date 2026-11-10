import React from 'react';
import {
  X,
  Clock,
  Sun,
  Sunset,
  Calendar,
  CalendarDays,
  Sparkles
} from 'lucide-react';

interface SnoozeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSnooze: (snoozeLabel: string) => void;
}

export const SnoozeModal: React.FC<SnoozeModalProps> = ({
  isOpen,
  onClose,
  onSelectSnooze,
}) => {
  if (!isOpen) return null;

  const snoozeOptions = [
    { label: 'Hoje mais tarde', time: '18:00', icon: Sunset, color: 'text-amber-500' },
    { label: 'Amanhã de manhã', time: '08:00', icon: Sun, color: 'text-amber-400' },
    { label: 'Neste fim de semana', time: 'Sáb, 09:00', icon: Calendar, color: 'text-sky-500' },
    { label: 'Próxima semana', time: 'Seg, 08:00', icon: CalendarDays, color: 'text-indigo-500' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-150 select-none">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-500" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">
              Adiar conversa (Snooze)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Options */}
        <div className="p-2 space-y-1">
          {snoozeOptions.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.label}
                onClick={() => {
                  onSelectSnooze(`${opt.label} (${opt.time})`);
                  onClose();
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${opt.color}`} />
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {opt.label}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  {opt.time}
                </span>
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-[11px] text-slate-400 text-center">
          O e-mail reaparecerá no topo da Caixa de Entrada no horário selecionado.
        </div>
      </div>
    </div>
  );
};
