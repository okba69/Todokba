import { useState } from 'react';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useStore } from '../store';
import TaskCard from '../components/TaskCard';
import AddTaskInline from '../components/AddTaskInline';

export default function UpcomingView() {
  const { state } = useStore();
  const [weekOffset, setWeekOffset] = useState(0);
  const [addingDate, setAddingDate] = useState<string | null>(null);

  const baseDate = addDays(new Date(), weekOffset * 7);
  const weekStart = startOfWeek(baseDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(baseDate, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const monthLabel = format(baseDate, 'MMMM yyyy', { locale: fr });

  const today = format(new Date(), 'yyyy-MM-dd');

  // Overdue tasks (only show when on current week)
  const overdue = weekOffset === 0
    ? state.tasks.filter(t => !t.parentId && !t.completed && t.dueDate && t.dueDate < today)
    : [];

  function tasksForDay(day: Date) {
    const dateStr = format(day, 'yyyy-MM-dd');
    return state.tasks.filter(t => !t.parentId && !t.completed && t.dueDate === dateStr);
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-baseline gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Prochainement</h1>
            <button onClick={() => setWeekOffset(0)} className="text-xs text-blue-500 hover:underline">
              {weekOffset !== 0 ? "Aujourd'hui" : ''}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 capitalize min-w-28 text-center">{monthLabel}</span>
            <button onClick={() => setWeekOffset(w => w - 1)} className="p-1 hover:bg-gray-100 rounded"><ChevronLeft size={16} /></button>
            <button onClick={() => setWeekOffset(w => w + 1)} className="p-1 hover:bg-gray-100 rounded"><ChevronRight size={16} /></button>
          </div>
        </div>

        {/* Overdue */}
        {overdue.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 px-4 py-1.5 border-b border-gray-100">
              <span className="text-sm font-semibold text-red-500">En retard</span>
              <button className="ml-auto text-xs text-blue-500 hover:underline">Reporter</button>
            </div>
            {overdue.map(t => <TaskCard key={t.id} task={t} />)}
          </div>
        )}

        {/* Days */}
        {days.map(day => {
          const dayTasks = tasksForDay(day);
          const dateStr = format(day, 'yyyy-MM-dd');
          const isCurrentDay = isToday(day);
          const dayLabel = isCurrentDay
            ? `${format(day, 'd MMMM', { locale: fr })} · Aujourd'hui`
            : format(day, 'EEEE d MMMM', { locale: fr });

          return (
            <div key={dateStr} className="mb-4">
              <div className={`flex items-center gap-2 px-4 py-2 border-b border-gray-100 ${isCurrentDay ? 'text-red-600' : 'text-gray-600'}`}>
                <span className={`text-sm font-semibold capitalize ${isCurrentDay ? 'text-red-600' : ''}`}>
                  {dayLabel}
                </span>
              </div>

              {dayTasks.length === 0 && addingDate !== dateStr && (
                <button
                  onClick={() => setAddingDate(dateStr)}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-300 hover:text-gray-500 hover:bg-gray-50 rounded-md transition-colors"
                >
                  <Plus size={14} />
                  Ajouter
                </button>
              )}

              {dayTasks.map(t => <TaskCard key={t.id} task={t} />)}

              {addingDate === dateStr ? (
                <AddTaskInline dueDate={dateStr} onClose={() => setAddingDate(null)} />
              ) : dayTasks.length > 0 && (
                <button
                  onClick={() => setAddingDate(dateStr)}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-400 hover:text-red-500 hover:bg-gray-50 rounded-md transition-colors"
                >
                  <Plus size={14} className="text-red-400" />
                  Ajouter une tâche
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
