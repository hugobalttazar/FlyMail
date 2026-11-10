import React, { useState } from 'react';
import {
  Calendar,
  Users,
  CheckSquare,
  Plus,
  Clock,
  MapPin,
  Mail,
  Phone,
  Search,
  Check,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { CalendarEvent, Contact, TaskItem } from '../types/mail';

interface RightSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  events: CalendarEvent[];
  contacts: Contact[];
  tasks: TaskItem[];
  onToggleTask: (taskId: string) => void;
  onAddTask: (title: string, priority: 'high' | 'medium' | 'low') => void;
  onSendEmailToContact: (contact: Contact) => void;
  onAddEvent: (title: string, time: string) => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  isOpen,
  onClose,
  events,
  contacts,
  tasks,
  onToggleTask,
  onAddTask,
  onSendEmailToContact,
  onAddEvent,
}) => {
  const [activeTab, setActiveTab] = useState<'calendar' | 'contacts' | 'tasks'>('calendar');
  const [contactSearch, setContactSearch] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventTime, setNewEventTime] = useState('14:00 - 14:30');

  if (!isOpen) return null;

  const filteredContacts = contacts.filter(
    c => c.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
         c.email.toLowerCase().includes(contactSearch.toLowerCase())
  );

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    onAddTask(newTaskTitle.trim(), 'medium');
    setNewTaskTitle('');
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;
    onAddEvent(newEventTitle.trim(), newEventTime);
    setNewEventTitle('');
  };

  return (
    <div className="w-80 flex-shrink-0 bg-slate-50 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col h-full select-none z-10">
      {/* Top Tab Bar (Mailbird Companion Apps) */}
      <div className="h-14 px-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-950">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'calendar'
                ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Agenda</span>
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'tasks'
                ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Tarefas</span>
          </button>

          <button
            onClick={() => setActiveTab('contacts')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'contacts'
                ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Contatos</span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded"
          title="Fechar painel lateral"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Tab 1: Calendar View */}
      {activeTab === 'calendar' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Compromissos de Hoje
            </span>
            <span className="text-[11px] font-mono text-sky-600 dark:text-sky-400">
              {new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })}
            </span>
          </div>

          {/* Quick Add Event Form */}
          <form onSubmit={handleCreateEvent} className="p-2.5 rounded-lg bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2">
            <input
              type="text"
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
              placeholder="Novo evento ou reunião..."
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-sky-500"
            />
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newEventTime}
                onChange={(e) => setNewEventTime(e.target.value)}
                placeholder="Horário (ex: 15:00)"
                className="flex-1 px-2 py-1 text-[11px] font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-slate-800 dark:text-slate-200"
              />
              <button
                type="submit"
                disabled={!newEventTitle.trim()}
                className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded text-xs font-medium flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>Adicionar</span>
              </button>
            </div>
          </form>

          {/* Events List */}
          <div className="space-y-2">
            {events.map((ev) => (
              <div
                key={ev.id}
                className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 shadow-xs space-y-1.5 border-l-4"
                style={{ borderLeftColor: ev.color }}
              >
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">
                  {ev.title}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {ev.time}
                  </span>
                  <span>·</span>
                  <span>{ev.duration}</span>
                </div>
                {ev.location && (
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 truncate">
                    <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{ev.location}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Tasks View */}
      {activeTab === 'tasks' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Minhas Tarefas & Metas
            </span>
            <span className="text-[11px] text-slate-400 tabular-nums">
              {tasks.filter(t => t.completed).length}/{tasks.length} concluídas
            </span>
          </div>

          {/* Add Task input */}
          <form onSubmit={handleCreateTask} className="flex gap-1.5">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Adicionar tarefa rápida..."
              className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-sky-500"
            />
            <button
              type="submit"
              disabled={!newTaskTitle.trim()}
              className="p-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>

          {/* Tasks List */}
          <div className="space-y-1.5">
            {tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => onToggleTask(task.id)}
                className={`p-2.5 rounded-lg border transition-colors cursor-pointer flex items-start gap-2.5 ${
                  task.completed
                    ? 'bg-slate-100/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60'
                    : 'bg-white dark:bg-slate-800/70 border-slate-200 dark:border-slate-800 hover:border-sky-300'
                }`}
              >
                <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border transition-colors flex-shrink-0 ${
                  task.completed
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'border-slate-300 dark:border-slate-600'
                }`}>
                  {task.completed && <Check className="w-3 h-3 stroke-3" />}
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`text-xs ${
                    task.completed
                      ? 'line-through text-slate-400 dark:text-slate-500'
                      : 'text-slate-800 dark:text-slate-200'
                  }`}>
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                    {task.tag && (
                      <span className="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.2 rounded font-medium">
                        {task.tag}
                      </span>
                    )}
                    {task.dueDate && <span>{task.dueDate}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Contacts View */}
      {activeTab === 'contacts' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={contactSearch}
              onChange={(e) => setContactSearch(e.target.value)}
              placeholder="Buscar contatos..."
              className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="space-y-2">
            {filteredContacts.map((contact) => (
              <div
                key={contact.id}
                className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 shadow-xs space-y-2 hover:border-sky-300 dark:hover:border-sky-700 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 font-bold text-xs flex items-center justify-center flex-shrink-0">
                    {contact.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {contact.name}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {contact.role || contact.company}
                    </div>
                  </div>
                </div>

                <div className="pt-1.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                    {contact.email}
                  </span>
                  <button
                    onClick={() => onSendEmailToContact(contact)}
                    title="Enviar e-mail para este contato"
                    className="flex items-center gap-1 px-2 py-1 bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-300 rounded text-[11px] font-medium hover:bg-sky-100 dark:hover:bg-sky-900 transition-colors"
                  >
                    <Mail className="w-3 h-3" />
                    <span>Escrever</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
