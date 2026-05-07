import { useState, useRef, useEffect } from 'react';
import { Flag, X, Check } from 'lucide-react';
import { useStore, priorityColor } from '../store';
import type { Priority } from '../types';

interface Props {
  projectId?: string | null;
  dueDate?: string | null;
  onClose: () => void;
}

export default function AddTaskInline({ projectId, dueDate, onClose }: Props) {
  const { state, dispatch, createTask } = useStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>(4);
  const [due, setDue] = useState<string>(dueDate ?? '');
  const [selProjectId, setSelProjectId] = useState<string | null>(projectId ?? null);
  const [showPriority, setShowPriority] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  function submit() {
    if (!title.trim()) return;
    const task = createTask({
      title: title.trim(),
      description,
      priority,
      dueDate: due || null,
      projectId: selProjectId,
    });
    dispatch({ type: 'ADD_TASK', task });
    onClose();
  }

  return (
    <div className="border border-gray-300 rounded-lg p-3 bg-white shadow-sm mx-4 my-2">
      <input
        ref={inputRef}
        value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') onClose(); }}
        placeholder="Nom de la tâche"
        className="w-full text-sm font-medium text-gray-800 placeholder-gray-400 outline-none"
      />
      <input
        value={description}
        onChange={e => setDescription(e.target.value)}
        placeholder="Description"
        className="w-full text-xs text-gray-500 placeholder-gray-400 outline-none mt-1"
      />

      <div className="flex items-center gap-2 mt-3 border-t border-gray-100 pt-2">
        {/* Due date */}
        <input
          type="date"
          value={due}
          onChange={e => setDue(e.target.value)}
          className="text-xs text-gray-500 border border-gray-200 rounded px-2 py-1 outline-none"
        />

        {/* Priority */}
        <div className="relative">
          <button
            onClick={() => setShowPriority(!showPriority)}
            className="flex items-center gap-1 text-xs border border-gray-200 rounded px-2 py-1 hover:bg-gray-50"
            style={{ color: priorityColor(priority) }}
          >
            <Flag size={11} />
            P{priority}
          </button>
          {showPriority && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-1 flex gap-1">
              {([1, 2, 3, 4] as Priority[]).map(p => (
                <button
                  key={p}
                  onClick={() => { setPriority(p); setShowPriority(false); }}
                  className={`px-2 py-1 rounded text-xs font-medium ${priority === p ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                  style={{ color: priorityColor(p) }}
                >
                  P{p}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Project */}
        <select
          value={selProjectId ?? ''}
          onChange={e => setSelProjectId(e.target.value || null)}
          className="text-xs border border-gray-200 rounded px-2 py-1 outline-none text-gray-500"
        >
          <option value="">Boîte de réception</option>
          {state.projects.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <div className="flex-1" />

        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded text-gray-400">
          <X size={14} />
        </button>
        <button
          onClick={submit}
          disabled={!title.trim()}
          className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Check size={12} />
          Ajouter
        </button>
      </div>
    </div>
  );
}
