import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { CalendarEvent } from '../types/mail';

interface CalendarViewProps {
  events: CalendarEvent[];
  onAddEvent: (title: string, time: string, category: 'work' | 'personal' | 'meeting') => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ events, onAddEvent }) => {
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('10:00 - 11:00');
  const [category, setCategory] = useState<'work' | 'personal' | 'meeting'>('work');

  const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddEvent(title.trim(), time, category);
    setTitle('');
    setShowAddModal(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-hidden select-none">
      {/* Top Header */}
      <div className="h-14 px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-5 h-5 text-sky-500" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Calendário Integrado do FlyMail
          </h2>
          <span className="text-xs text-slate-400 font-medium">Novembro 2026</span>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Compromisso</span>
        </button>
      </div>

      {/* Main Content Split: Days grid + Daily Agenda */}
      <div className="flex-1 flex overflow-hidden">
        {/* Days Grid */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-7 gap-2 mb-3 text-center text-xs font-bold text-slate-400 uppercase">
            <span>Dom</span>
            <span>Seg</span>
            <span>Ter</span>
            <span>Qua</span>
            <span>Qui</span>
            <span>Sex</span>
            <span>Sáb</span>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {daysInMonth.map((day) => {
              const isToday = day === 8;
              const isSelected = day === selectedDay;
              const hasEvents = day === 8;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`h-24 p-2 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    isSelected
                      ? 'border-sky-500 ring-2 ring-sky-500/20 bg-sky-50/40 dark:bg-sky-950/20'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold tabular-nums ${
                      isToday
                        ? 'w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center'
                        : isSelected
                        ? 'text-sky-600 dark:text-sky-400'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}>
                      {day}
                    </span>
                  </div>

                  {hasEvents && (
                    <div className="space-y-1">
                      <div className="text-[10px] truncate px-1.5 py-0.5 rounded bg-sky-100 dark:bg-sky-900 text-sky-800 dark:text-sky-200 font-medium">
                        Daily FlyMail
                      </div>
                      <div className="text-[10px] truncate px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 font-medium">
                        Demo .EXE
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Agenda Column */}
        <div className="w-80 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 overflow-y-auto space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Agenda do Dia {selectedDay} de Novembro
          </h3>

          <div className="space-y-3">
            {events.map((ev) => (
              <div
                key={ev.id}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 space-y-2 border-l-4"
                style={{ borderLeftColor: ev.color }}
              >
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {ev.title}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono">{ev.time}</span>
                  <span>({ev.duration})</span>
                </div>
                {ev.location && (
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 truncate">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{ev.location}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xl space-y-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Agendar Evento</h4>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título do evento..."
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                required
              />
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="Horário (ex: 14:00 - 15:00)"
                className="w-full px-3 py-1.5 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                required
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-sky-600 text-white rounded-lg hover:bg-sky-500"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
