import React, { useState, useEffect } from 'react';
import { X, Flag, Tag, Trash2, Plus, Link2, ArrowRight, ArrowLeft, Lock, CheckCircle2, Check } from 'lucide-react';
import { useStore, priorityColor } from '../store';
import type { Task, Priority } from '../types';

interface Props {
  taskId: string;
  onClose: () => void;
}

type Tab = 'details' | 'deps' | 'subtasks';

export default function TaskDetail({ taskId, onClose }: Props) {
  const { state, dispatch, isTaskBlocked, createTask } = useStore();
  const task = state.tasks.find(t => t.id === taskId);
  const [tab, setTab] = useState<Tab>('details');
  const [addingDep, setAddingDep] = useState<'dependsOn' | 'blocks' | null>(null);
  const [depSearch, setDepSearch] = useState('');
  const [editTitle, setEditTitle] = useState(task?.title ?? '');
  const [editDesc, setEditDesc] = useState(task?.description ?? '');
  const [addingSubtask, setAddingSubtask] = useState(false);
  const [subtaskTitle, setSubtaskTitle] = useState('');

  useEffect(() => {
    setEditTitle(task?.title ?? '');
    setEditDesc(task?.description ?? '');
  }, [taskId]);

  if (!task) return null;

  const blocked = isTaskBlocked(task.id);
  const dependsOnTasks = state.tasks.filter(t => task.dependsOn.includes(t.id));
  const blocksTasks = state.tasks.filter(t => task.blocks.includes(t.id));
  const subtasks = state.tasks.filter(t => t.parentId === task.id);
  const project = state.projects.find(p => p.id === task.projectId);

  const searchResults = state.tasks.filter(t =>
    t.id !== task.id &&
    !t.parentId &&
    t.title.toLowerCase().includes(depSearch.toLowerCase()) &&
    (addingDep === 'dependsOn' ? !task.dependsOn.includes(t.id) : !task.blocks.includes(t.id))
  ).slice(0, 6);

  function saveTitle() {
    if (editTitle.trim() && editTitle !== task!.title)
      dispatch({ type: 'UPDATE_TASK', id: task!.id, patch: { title: editTitle.trim() } });
  }

  function saveDesc() {
    if (editDesc !== task!.description)
      dispatch({ type: 'UPDATE_TASK', id: task!.id, patch: { description: editDesc } });
  }

  function addSubtask() {
    if (!subtaskTitle.trim()) return;
    const sub = createTask({ title: subtaskTitle.trim(), parentId: task!.id, projectId: task!.projectId });
    dispatch({ type: 'ADD_TASK', task: sub });
    setSubtaskTitle('');
    setAddingSubtask(false);
  }

  return (
    <div className="w-96 flex-shrink-0 bg-white border-l border-gray-200 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          {project && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <span className="w-2 h-2 rounded-full" style={{ background: project.color }} />
              {project.name}
            </span>
          )}
          {!project && <span className="text-xs text-gray-400">Boîte de réception</span>}
        </div>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded text-gray-400">
          <X size={16} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 px-4">
        {(['details', 'deps', 'subtasks'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`py-2 px-3 text-xs font-medium border-b-2 transition-colors ${
              tab === t ? 'border-red-500 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'details' ? 'Détails' : t === 'deps' ? (
              <span className="flex items-center gap-1">
                <Link2 size={11} />
                Dépendances
                {(task.dependsOn.length + task.blocks.length) > 0 && (
                  <span className="bg-blue-100 text-blue-600 rounded-full px-1.5 text-xs">
                    {task.dependsOn.length + task.blocks.length}
                  </span>
                )}
              </span>
            ) : (
              <span className="flex items-center gap-1">
                Sous-tâches
                {subtasks.length > 0 && (
                  <span className="bg-gray-100 text-gray-600 rounded-full px-1.5 text-xs">{subtasks.length}</span>
                )}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* ─── TAB: DETAILS ─── */}
        {tab === 'details' && (
          <div className="p-4 space-y-4">
            {/* Blocked badge */}
            {blocked && (
              <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 text-xs text-orange-700">
                <Lock size={12} />
                <span>Cette tâche est bloquée — des prérequis ne sont pas terminés.</span>
              </div>
            )}

            {/* Title */}
            <div className="flex items-start gap-3">
              <button
                onClick={() => dispatch({ type: 'TOGGLE_TASK', id: task.id })}
                className="mt-1 flex-shrink-0"
              >
                <div
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                  style={{ borderColor: task.completed ? '#9ca3af' : priorityColor(task.priority), background: task.completed ? '#9ca3af' : 'transparent' }}
                >
                  {task.completed && (
                    <svg viewBox="0 0 12 12" className="w-3 h-3 fill-current text-white">
                      <path d="M1.5 6L4.5 9L10.5 3" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                    </svg>
                  )}
                </div>
              </button>
              <input
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                onBlur={saveTitle}
                onKeyDown={e => { if (e.key === 'Enter') { saveTitle(); e.currentTarget.blur(); } }}
                className="flex-1 text-base font-medium text-gray-800 outline-none border-b border-transparent hover:border-gray-200 focus:border-red-300 pb-0.5 transition-colors"
              />
            </div>

            {/* Description */}
            <textarea
              value={editDesc}
              onChange={e => setEditDesc(e.target.value)}
              onBlur={saveDesc}
              placeholder="Description..."
              rows={3}
              className="w-full text-sm text-gray-600 placeholder-gray-400 outline-none resize-none border border-transparent hover:border-gray-200 focus:border-red-300 rounded p-1 transition-colors"
            />

            {/* Priority */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500">Priorité</label>
              <div className="flex gap-2">
                {([1, 2, 3, 4] as Priority[]).map(p => (
                  <button
                    key={p}
                    onClick={() => dispatch({ type: 'UPDATE_TASK', id: task.id, patch: { priority: p } })}
                    className={`flex items-center gap-1 px-2 py-1 rounded border text-xs font-medium transition-all ${
                      task.priority === p ? 'border-current bg-opacity-10' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={{ color: priorityColor(p), background: task.priority === p ? `${priorityColor(p)}15` : undefined }}
                  >
                    <Flag size={10} />
                    P{p}
                  </button>
                ))}
              </div>
            </div>

            {/* Due date */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500">Échéance</label>
              <input
                type="date"
                value={task.dueDate ?? ''}
                onChange={e => dispatch({ type: 'UPDATE_TASK', id: task.id, patch: { dueDate: e.target.value || null } })}
                className="block w-full text-sm border border-gray-200 rounded-md px-3 py-1.5 outline-none focus:border-red-300"
              />
            </div>

            {/* Project */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500">Projet</label>
              <select
                value={task.projectId ?? ''}
                onChange={e => dispatch({ type: 'UPDATE_TASK', id: task.id, patch: { projectId: e.target.value || null } })}
                className="block w-full text-sm border border-gray-200 rounded-md px-3 py-1.5 outline-none focus:border-red-300"
              >
                <option value="">Boîte de réception</option>
                {state.projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Labels */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500">Étiquettes</label>
              <div className="flex flex-wrap gap-1">
                {state.labels.map(l => {
                  const active = task.labelIds.includes(l.id);
                  return (
                    <button
                      key={l.id}
                      onClick={() => dispatch({
                        type: 'UPDATE_TASK',
                        id: task.id,
                        patch: { labelIds: active ? task.labelIds.filter(id => id !== l.id) : [...task.labelIds, l.id] },
                      })}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-all ${
                        active ? 'border-current font-medium' : 'border-gray-200 text-gray-400 hover:border-gray-300'
                      }`}
                      style={{ color: active ? l.color : undefined, background: active ? `${l.color}15` : undefined }}
                    >
                      <Tag size={9} />
                      {l.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Delete */}
            <button
              onClick={() => { dispatch({ type: 'DELETE_TASK', id: task.id }); onClose(); }}
              className="flex items-center gap-2 text-xs text-red-400 hover:text-red-600 mt-4"
            >
              <Trash2 size={12} />
              Supprimer la tâche
            </button>
          </div>
        )}

        {/* ─── TAB: DEPENDENCIES ─── */}
        {tab === 'deps' && (
          <div className="p-4 space-y-5">
            <p className="text-xs text-gray-500 leading-relaxed">
              Les dépendances définissent l'ordre d'exécution des tâches.
              Une tâche bloquée ne peut pas être démarrée tant que ses prérequis ne sont pas terminés.
            </p>

            {/* Depends on */}
            <section>
              <div className="flex items-center justify-between mb-2">
                <h3 className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  <ArrowLeft size={12} className="text-orange-400" />
                  Dépend de
                  <span className="text-gray-400 normal-case font-normal">(prérequis)</span>
                </h3>
                <button
                  onClick={() => { setAddingDep('dependsOn'); setDepSearch(''); }}
                  className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-0.5"
                >
                  <Plus size={12} />
                </button>
              </div>

              {dependsOnTasks.length === 0 && addingDep !== 'dependsOn' && (
                <p className="text-xs text-gray-400 italic">Aucun prérequis</p>
              )}

              <div className="space-y-1">
                {dependsOnTasks.map(dep => (
                  <DepItem key={dep.id} task={dep} onRemove={() => dispatch({ type: 'REMOVE_DEPENDENCY', taskId: task.id, dependsOnId: dep.id })} onSelect={() => dispatch({ type: 'SELECT_TASK', id: dep.id })} />
                ))}
              </div>

              {addingDep === 'dependsOn' && (
                <DepSearch
                  value={depSearch}
                  onChange={setDepSearch}
                  results={searchResults}
                  onSelect={t => { dispatch({ type: 'ADD_DEPENDENCY', taskId: task.id, dependsOnId: t.id }); setAddingDep(null); }}
                  onClose={() => setAddingDep(null)}
                />
              )}
            </section>

            {/* Blocks */}
            <section>
              <div className="flex items-center justify-between mb-2">
                <h3 className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  <ArrowRight size={12} className="text-blue-400" />
                  Bloque
                  <span className="text-gray-400 normal-case font-normal">(implique)</span>
                </h3>
                <button
                  onClick={() => { setAddingDep('blocks'); setDepSearch(''); }}
                  className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-0.5"
                >
                  <Plus size={12} />
                </button>
              </div>

              {blocksTasks.length === 0 && addingDep !== 'blocks' && (
                <p className="text-xs text-gray-400 italic">Aucune tâche bloquée</p>
              )}

              <div className="space-y-1">
                {blocksTasks.map(b => (
                  <DepItem key={b.id} task={b} onRemove={() => dispatch({ type: 'REMOVE_DEPENDENCY', taskId: b.id, dependsOnId: task.id })} onSelect={() => dispatch({ type: 'SELECT_TASK', id: b.id })} />
                ))}
              </div>

              {addingDep === 'blocks' && (
                <DepSearch
                  value={depSearch}
                  onChange={setDepSearch}
                  results={searchResults}
                  onSelect={t => { dispatch({ type: 'ADD_DEPENDENCY', taskId: t.id, dependsOnId: task.id }); setAddingDep(null); }}
                  onClose={() => setAddingDep(null)}
                />
              )}
            </section>

            {/* Visual chain */}
            {(dependsOnTasks.length > 0 || blocksTasks.length > 0) && (
              <section className="bg-gray-50 rounded-lg p-3">
                <h3 className="text-xs font-semibold text-gray-500 mb-2">Chaîne</h3>
                <div className="flex items-center gap-1 flex-wrap">
                  {dependsOnTasks.map(d => (
                    <React.Fragment key={d.id}>
                      <span className={`text-xs px-2 py-0.5 rounded ${d.completed ? 'bg-green-100 text-green-700 line-through' : 'bg-orange-100 text-orange-700'}`}>{d.title}</span>
                      <ArrowRight size={12} className="text-gray-400" />
                    </React.Fragment>
                  ))}
                  <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-medium">{task.title}</span>
                  {blocksTasks.map(b => (
                    <React.Fragment key={b.id}>
                      <ArrowRight size={12} className="text-gray-400" />
                      <span className={`text-xs px-2 py-0.5 rounded ${b.completed ? 'bg-green-100 text-green-700 line-through' : 'bg-gray-100 text-gray-600'}`}>{b.title}</span>
                    </React.Fragment>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* ─── TAB: SUBTASKS ─── */}
        {tab === 'subtasks' && (
          <div className="p-4 space-y-2">
            {subtasks.length > 0 && (
              <div className="text-xs text-gray-400 mb-2">
                {subtasks.filter(t => t.completed).length}/{subtasks.length} terminées
              </div>
            )}
            {subtasks.map(sub => (
              <div key={sub.id} className="flex items-center gap-2 group hover:bg-gray-50 rounded px-2 py-1.5 cursor-pointer" onClick={() => dispatch({ type: 'SELECT_TASK', id: sub.id })}>
                <button onClick={e => { e.stopPropagation(); dispatch({ type: 'TOGGLE_TASK', id: sub.id }); }}>
                  <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${sub.completed ? 'bg-gray-400 border-gray-400' : 'border-gray-300'}`}>
                    {sub.completed && <svg viewBox="0 0 12 12" className="w-2 h-2 text-white fill-current"><path d="M1.5 6L4.5 9L10.5 3" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" /></svg>}
                  </div>
                </button>
                <span className={`text-sm flex-1 ${sub.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>{sub.title}</span>
                <button onClick={e => { e.stopPropagation(); dispatch({ type: 'DELETE_TASK', id: sub.id }); }} className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-red-500">
                  <Trash2 size={11} />
                </button>
              </div>
            ))}

            {addingSubtask ? (
              <div className="flex items-center gap-2 mt-2">
                <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                <input
                  autoFocus
                  value={subtaskTitle}
                  onChange={e => setSubtaskTitle(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') addSubtask(); if (e.key === 'Escape') setAddingSubtask(false); }}
                  placeholder="Nom de la sous-tâche"
                  className="flex-1 text-sm border-b border-gray-300 outline-none pb-0.5"
                />
                <button onClick={addSubtask} className="p-1 bg-red-500 text-white rounded hover:bg-red-600"><Check size={11} /></button>
                <button onClick={() => setAddingSubtask(false)} className="p-1 hover:bg-gray-100 rounded text-gray-400"><X size={11} /></button>
              </div>
            ) : (
              <button
                onClick={() => setAddingSubtask(true)}
                className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-600 mt-2"
              >
                <Plus size={12} />
                Ajouter une sous-tâche
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function DepItem({ task, onRemove, onSelect }: { task: Task; onRemove: () => void; onSelect: () => void }) {
  return (
    <div className="flex items-center gap-2 group bg-white border border-gray-200 rounded-md px-2 py-1.5 hover:border-gray-300">
      <button onClick={onSelect} className="flex items-center gap-2 flex-1 min-w-0">
        <div className={`w-3 h-3 rounded-full border flex-shrink-0 ${task.completed ? 'bg-gray-400 border-gray-400' : 'border-gray-400'}`} />
        <span className={`text-xs truncate ${task.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
          {task.title}
        </span>
        {task.completed && <CheckCircle2 size={11} className="text-green-500 flex-shrink-0" />}
      </button>
      <button onClick={onRemove} className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-red-500 text-gray-400">
        <X size={11} />
      </button>
    </div>
  );
}

function DepSearch({ value, onChange, results, onSelect, onClose }: {
  value: string;
  onChange: (v: string) => void;
  results: Task[];
  onSelect: (t: Task) => void;
  onClose: () => void;
}) {
  return (
    <div className="mt-2 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      <div className="flex items-center gap-2 px-2 border-b border-gray-100">
        <input
          autoFocus
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={e => e.key === 'Escape' && onClose()}
          placeholder="Rechercher une tâche..."
          className="flex-1 text-xs py-2 outline-none"
        />
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={12} /></button>
      </div>
      {results.length === 0 && (
        <p className="text-xs text-gray-400 px-3 py-2">Aucun résultat</p>
      )}
      {results.map(t => (
        <button
          key={t.id}
          onClick={() => onSelect(t)}
          className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-50 text-left"
        >
          <div className={`w-3 h-3 rounded-full border flex-shrink-0 ${t.completed ? 'bg-gray-400 border-gray-400' : 'border-gray-400'}`} />
          <span className="text-xs text-gray-700 truncate">{t.title}</span>
        </button>
      ))}
    </div>
  );
}
