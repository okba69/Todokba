import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useStore } from '../store';
import TaskCard from '../components/TaskCard';
import AddTaskInline from '../components/AddTaskInline';

export default function InboxView() {
  const { state } = useStore();
  const [adding, setAdding] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  // Group by project sections
  const noProject = state.tasks.filter(t => !t.projectId && !t.parentId && !t.completed);
  const completedTasks = state.tasks.filter(t => !t.parentId && t.completed);

  // Group by project
  const byProject: Record<string, typeof noProject> = {};
  state.tasks.filter(t => t.projectId && !t.parentId && !t.completed).forEach(t => {
    const key = t.projectId!;
    if (!byProject[key]) byProject[key] = [];
    byProject[key].push(t);
  });

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Boîte de réception</h1>

        {/* No-project tasks */}
        {noProject.map(t => <TaskCard key={t.id} task={t} />)}

        {/* By project */}
        {Object.entries(byProject).map(([projectId, tasks]) => {
          const project = state.projects.find(p => p.id === projectId);
          return (
            <div key={projectId} className="mt-4">
              <div className="flex items-center gap-2 px-4 py-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: project?.color }} />
                <span className="text-sm font-medium text-gray-700">{project?.name}</span>
              </div>
              {tasks.map(t => <TaskCard key={t.id} task={t} />)}
            </div>
          );
        })}

        {/* Add task */}
        {adding ? (
          <AddTaskInline onClose={() => setAdding(false)} />
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-400 hover:text-red-500 hover:bg-gray-50 rounded-md mt-2 transition-colors"
          >
            <Plus size={16} className="text-red-400" />
            Ajouter une tâche
          </button>
        )}

        {/* Completed tasks */}
        {completedTasks.length > 0 && (
          <div className="mt-6">
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-600 mb-2 px-4"
            >
              {showCompleted ? '▼' : '▶'} {completedTasks.length} tâche{completedTasks.length > 1 ? 's' : ''} terminée{completedTasks.length > 1 ? 's' : ''}
            </button>
            {showCompleted && completedTasks.map(t => <TaskCard key={t.id} task={t} />)}
          </div>
        )}
      </div>
    </div>
  );
}
