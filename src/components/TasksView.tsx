import React, { useState } from 'react';
import { CheckSquare, Plus, Check, Trash2, Filter } from 'lucide-react';
import { TaskItem } from '../types/mail';

interface TasksViewProps {
  tasks: TaskItem[];
  onToggleTask: (taskId: string) => void;
  onAddTask: (title: string, priority: 'high' | 'medium' | 'low', tag?: string) => void;
  onDeleteTask: (taskId: string) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  onToggleTask,
  onAddTask,
  onDeleteTask,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [tag, setTag] = useState('');

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'pending') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddTask(title.trim(), priority, tag.trim() || undefined);
    setTitle('');
    setTag('');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-hidden select-none">
      {/* Top Header */}
      <div className="h-14 px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <CheckSquare className="w-5 h-5 text-sky-500" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Painel de Tarefas & Produtividade
          </h2>
          <span className="text-xs text-slate-400 font-medium">
            ({tasks.filter(t => !t.completed).length} pendentes)
          </span>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              filter === 'all'
                ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Todas ({tasks.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              filter === 'pending'
                ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Pendentes ({tasks.filter(t => !t.completed).length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              filter === 'completed'
                ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Concluídas ({tasks.filter(t => t.completed).length})
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 p-6 overflow-y-auto max-w-4xl mx-auto w-full space-y-4">
        {/* Quick Add Form */}
        <form onSubmit={handleAdd} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="O que você precisa fazer hoje?"
              className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-sky-500"
            />
            <input
              type="text"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="Categoria (ex: UX, DevOps)..."
              className="w-40 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-sky-500"
            />
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'high' | 'medium' | 'low')}
              className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-medium"
            >
              <option value="high">Alta Prioridade</option>
              <option value="medium">Média Prioridade</option>
              <option value="low">Baixa Prioridade</option>
            </select>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar</span>
            </button>
          </div>
        </form>

        {/* Task List */}
        <div className="space-y-2">
          {filteredTasks.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              Nenhuma tarefa encontrada neste filtro.
            </div>
          ) : (
            filteredTasks.map((t) => (
              <div
                key={t.id}
                className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                  t.completed
                    ? 'bg-slate-100/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-700'
                }`}
              >
                <div
                  onClick={() => onToggleTask(t.id)}
                  className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                >
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors flex-shrink-0 ${
                    t.completed
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'border-slate-300 dark:border-slate-600 hover:border-sky-500'
                  }`}>
                    {t.completed && <Check className="w-3.5 h-3.5 stroke-3" />}
                  </div>

                  <span className={`text-xs font-medium truncate ${
                    t.completed
                      ? 'line-through text-slate-400 dark:text-slate-500'
                      : 'text-slate-800 dark:text-slate-100'
                  }`}>
                    {t.title}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {t.tag && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                      {t.tag}
                    </span>
                  )}

                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                    t.priority === 'high'
                      ? 'bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400'
                      : t.priority === 'medium'
                      ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {t.priority}
                  </span>

                  <button
                    onClick={() => onDeleteTask(t.id)}
                    className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Excluir tarefa"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
