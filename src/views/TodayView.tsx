import { useState } from 'react';
import { Plus } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useStore } from '../store';
import TaskCard from '../components/TaskCard';
import AddTaskInline from '../components/AddTaskInline';

export default function TodayView() {
  const { state } = useStore();
  const [adding, setAdding] = useState(false);
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayLabel = format(new Date(), "EEEE d MMMM", { locale: fr });

  const tasks = state.tasks.filter(t => !t.parentId && t.dueDate === today && !t.completed);
  const overdueToday = state.tasks.filter(t => !t.parentId && t.dueDate && t.dueDate < today && !t.completed);
  const completed = state.tasks.filter(t => !t.parentId && t.dueDate === today && t.completed);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-baseline gap-3 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Aujourd'hui</h1>
          <span className="text-sm text-gray-400 capitalize">{todayLabel}</span>
        </div>

        {overdueToday.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 px-4 py-2">
              <span className="text-xs font-semibold text-red-500 uppercase tracking-wide">En retard</span>
            </div>
            {overdueToday.map(t => <TaskCard key={t.id} task={t} />)}
          </div>
        )}

        {tasks.length === 0 && !adding && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-sm">Aucune tâche pour aujourd'hui 🎉</p>
          </div>
        )}

        {tasks.map(t => <TaskCard key={t.id} task={t} />)}

        {adding ? (
          <AddTaskInline dueDate={today} onClose={() => setAdding(false)} />
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-400 hover:text-red-500 hover:bg-gray-50 rounded-md mt-2 transition-colors"
          >
            <Plus size={16} className="text-red-400" />
            Ajouter une tâche
          </button>
        )}

        {completed.length > 0 && (
          <div className="mt-6 border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-400 mb-2 px-4">{completed.length} terminée{completed.length > 1 ? 's' : ''} aujourd'hui</p>
            {completed.map(t => <TaskCard key={t.id} task={t} />)}
          </div>
        )}
      </div>
    </div>
  );
}
