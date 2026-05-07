import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useStore } from '../store';
import TaskCard from '../components/TaskCard';
import AddTaskInline from '../components/AddTaskInline';

export default function ProjectView() {
  const { state } = useStore();
  const [adding, setAdding] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  const project = state.projects.find(p => p.id === state.selectedProjectId);
  if (!project) return null;

  const tasks = state.tasks.filter(t => t.projectId === project.id && !t.parentId && !t.completed);
  const completed = state.tasks.filter(t => t.projectId === project.id && !t.parentId && t.completed);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-6">
          <span className="w-4 h-4 rounded-full" style={{ background: project.color }} />
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
        </div>

        {tasks.map(t => <TaskCard key={t.id} task={t} />)}

        {adding ? (
          <AddTaskInline projectId={project.id} onClose={() => setAdding(false)} />
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
          <div className="mt-6">
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-600 mb-2 px-4"
            >
              {showCompleted ? '▼' : '▶'} {completed.length} terminée{completed.length > 1 ? 's' : ''}
            </button>
            {showCompleted && completed.map(t => <TaskCard key={t.id} task={t} />)}
          </div>
        )}
      </div>
    </div>
  );
}
