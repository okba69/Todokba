import { Tag } from 'lucide-react';
import { useStore } from '../store';
import TaskCard from '../components/TaskCard';

export default function FiltersView() {
  const { state } = useStore();

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Filtres et étiquettes</h1>
        {state.labels.map(label => {
          const tasks = state.tasks.filter(t => t.labelIds.includes(label.id) && !t.completed && !t.parentId);
          return (
            <div key={label.id} className="mb-6">
              <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-100 mb-1">
                <Tag size={14} style={{ color: label.color }} />
                <span className="text-sm font-semibold text-gray-700">{label.name}</span>
                <span className="text-xs text-gray-400 ml-auto">{tasks.length}</span>
              </div>
              {tasks.length === 0 && <p className="text-xs text-gray-400 px-4 py-2">Aucune tâche</p>}
              {tasks.map(t => <TaskCard key={t.id} task={t} />)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
