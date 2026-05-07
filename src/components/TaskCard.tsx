import { Calendar, Link2, Lock, ChevronRight, Tag } from 'lucide-react';
import type { Task } from '../types';
import { useStore, priorityColor } from '../store';
import { format, isToday, isTomorrow, isPast, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Props {
  task: Task;
}

export default function TaskCard({ task }: Props) {
  const { state, dispatch, isTaskBlocked } = useStore();
  const blocked = isTaskBlocked(task.id);
  const selected = state.selectedTaskId === task.id;

  const project = state.projects.find(p => p.id === task.projectId);
  const labels = state.labels.filter(l => task.labelIds.includes(l.id));
  const subtasks = state.tasks.filter(t => t.parentId === task.id);
  const completedSubtasks = subtasks.filter(t => t.completed).length;

  function formatDueDate(dateStr: string): { text: string; color: string } {
    const date = parseISO(dateStr);
    if (isPast(date) && !isToday(date)) return { text: format(date, 'd MMM', { locale: fr }), color: 'text-red-500' };
    if (isToday(date)) return { text: "Aujourd'hui", color: 'text-green-600' };
    if (isTomorrow(date)) return { text: 'Demain', color: 'text-orange-500' };
    return { text: format(date, 'd MMM', { locale: fr }), color: 'text-gray-400' };
  }

  return (
    <div
      onClick={() => dispatch({ type: 'SELECT_TASK', id: task.id })}
      className={`group flex items-start gap-3 px-4 py-3 border-b border-gray-100 cursor-pointer transition-colors ${
        selected ? 'bg-red-50' : 'hover:bg-gray-50'
      } ${task.completed ? 'opacity-50' : ''}`}
    >
      {/* Checkbox */}
      <button
        onClick={e => { e.stopPropagation(); dispatch({ type: 'TOGGLE_TASK', id: task.id }); }}
        className="mt-0.5 flex-shrink-0"
      >
        <div
          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all hover:scale-110 ${
            task.completed
              ? 'bg-gray-400 border-gray-400'
              : `border-current hover:bg-opacity-10`
          }`}
          style={{ borderColor: task.completed ? undefined : priorityColor(task.priority), color: priorityColor(task.priority) }}
        >
          {task.completed && (
            <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 text-white fill-current">
              <path d="M1.5 6L4.5 9L10.5 3" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            </svg>
          )}
        </div>
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              {blocked && !task.completed && (
                <Lock size={12} className="text-orange-400 flex-shrink-0" />
              )}
              <p className={`text-sm leading-tight ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                {task.title}
              </p>
            </div>
            {task.description && (
              <p className="text-xs text-gray-400 mt-0.5 truncate">{task.description}</p>
            )}
          </div>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
          {task.dueDate && (() => {
            const { text, color } = formatDueDate(task.dueDate);
            return (
              <span className={`flex items-center gap-0.5 text-xs ${color}`}>
                <Calendar size={10} />
                {text}
              </span>
            );
          })()}

          {project && (
            <span className="flex items-center gap-0.5 text-xs text-gray-400">
              <span className="w-2 h-2 rounded-full inline-block" style={{ background: project.color }} />
              {project.name}
            </span>
          )}

          {labels.map(l => (
            <span key={l.id} className="flex items-center gap-0.5 text-xs" style={{ color: l.color }}>
              <Tag size={9} />
              {l.name}
            </span>
          ))}

          {subtasks.length > 0 && (
            <span className="flex items-center gap-0.5 text-xs text-gray-400">
              <ChevronRight size={10} />
              {completedSubtasks}/{subtasks.length}
            </span>
          )}

          {(task.dependsOn.length > 0 || task.blocks.length > 0) && (
            <span className="flex items-center gap-0.5 text-xs text-blue-400" title="Dépendances">
              <Link2 size={10} />
              {task.dependsOn.length + task.blocks.length}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
