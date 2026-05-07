import React, { useState } from 'react';
import { Plus, Search, Inbox, CalendarDays, Calendar, Tag, BarChart2, Hash, ChevronDown, ChevronRight, Trash2, X, Check } from 'lucide-react';
import { useStore, PROJECT_COLORS } from '../store';
import type { Project, View } from '../types';

export default function Sidebar() {
  const { state, dispatch } = useStore();
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectColor, setNewProjectColor] = useState(PROJECT_COLORS[0]);
  const [projectsOpen, setProjectsOpen] = useState(true);

  const todayCount = state.tasks.filter(t => !t.completed && t.dueDate === new Date().toISOString().slice(0, 10)).length;
  const inboxCount = state.tasks.filter(t => !t.completed && !t.projectId).length;

  function setView(view: View, projectId?: string) {
    dispatch({ type: 'SET_VIEW', view, projectId });
  }

  function createProject() {
    if (!newProjectName.trim()) return;
    const project: Project = {
      id: `p_${Date.now()}`,
      name: newProjectName.trim(),
      color: newProjectColor,
    };
    dispatch({ type: 'ADD_PROJECT', project });
    setNewProjectName('');
    setNewProjectColor(PROJECT_COLORS[0]);
    setShowNewProject(false);
  }

  const isActive = (view: View, projectId?: string) =>
    state.selectedView === view && (view !== 'project' || state.selectedProjectId === projectId);

  return (
    <aside className="w-64 flex-shrink-0 bg-[#fafafa] border-r border-gray-200 flex flex-col h-full overflow-y-auto">
      {/* User header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold">
            T
          </div>
          <span className="text-sm font-semibold text-gray-800">Todokba</span>
        </div>
      </div>

      {/* Quick actions */}
      <div className="px-3 py-2 space-y-0.5">
        <button
          onClick={() => dispatch({ type: 'SELECT_TASK', id: '__new__' })}
          className="flex items-center gap-2 w-full px-3 py-1.5 rounded-md hover:bg-gray-200 text-sm text-gray-700 transition-colors"
        >
          <Plus size={16} className="text-red-500" />
          <span className="text-red-500 font-medium">Ajouter une tâche</span>
        </button>
        <button className="flex items-center gap-2 w-full px-3 py-1.5 rounded-md hover:bg-gray-200 text-sm text-gray-500 transition-colors">
          <Search size={16} />
          <span>Recherche</span>
        </button>
      </div>

      <nav className="px-3 py-1 space-y-0.5">
        <NavItem
          icon={<Inbox size={16} />}
          label="Boîte de réception"
          count={inboxCount}
          active={isActive('inbox')}
          onClick={() => setView('inbox')}
        />
        <NavItem
          icon={<CalendarDays size={16} />}
          label="Aujourd'hui"
          count={todayCount}
          active={isActive('today')}
          onClick={() => setView('today')}
          countColor="text-red-500"
        />
        <NavItem
          icon={<Calendar size={16} />}
          label="Prochainement"
          active={isActive('upcoming')}
          onClick={() => setView('upcoming')}
        />
        <NavItem
          icon={<Tag size={16} />}
          label="Filtres et étiquettes"
          active={isActive('filters')}
          onClick={() => setView('filters')}
        />
        <NavItem
          icon={<BarChart2 size={16} />}
          label="Rapports"
          active={isActive('reports')}
          onClick={() => setView('reports')}
        />
      </nav>

      {/* Projects */}
      <div className="px-3 mt-4 flex-1">
        <button
          onClick={() => setProjectsOpen(!projectsOpen)}
          className="flex items-center justify-between w-full px-2 py-1 rounded hover:bg-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider transition-colors"
        >
          <div className="flex items-center gap-1">
            {projectsOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            Mes projets
          </div>
        </button>

        {projectsOpen && (
          <div className="mt-1 space-y-0.5">
            {state.projects.map(p => (
              <div key={p.id} className="group flex items-center">
                <button
                  onClick={() => setView('project', p.id)}
                  className={`flex items-center gap-2 flex-1 px-3 py-1.5 rounded-md text-sm transition-colors ${
                    isActive('project', p.id)
                      ? 'bg-red-50 text-red-700'
                      : 'hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  <span style={{ color: p.color }}>
                    {p.emoji ? <span className="text-base leading-none">{p.emoji}</span> : <Hash size={14} />}
                  </span>
                  <span className="truncate">{p.name}</span>
                  <span className="ml-auto text-xs text-gray-400">
                    {state.tasks.filter(t => t.projectId === p.id && !t.completed).length || ''}
                  </span>
                </button>
                <button
                  onClick={() => dispatch({ type: 'DELETE_PROJECT', id: p.id })}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:text-red-500 transition-all mr-1"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}

            {showNewProject ? (
              <div className="px-2 py-1">
                <input
                  autoFocus
                  value={newProjectName}
                  onChange={e => setNewProjectName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') createProject(); if (e.key === 'Escape') setShowNewProject(false); }}
                  placeholder="Nom du projet"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-red-400 mb-1"
                />
                <div className="flex gap-1 flex-wrap mb-1">
                  {PROJECT_COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => setNewProjectColor(c)}
                      className={`w-4 h-4 rounded-full border-2 transition-all ${newProjectColor === c ? 'border-gray-600 scale-110' : 'border-transparent'}`}
                      style={{ background: c }}
                    />
                  ))}
                </div>
                <div className="flex gap-1">
                  <button onClick={createProject} className="flex-1 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600">
                    <Check size={12} className="inline mr-1" />Ajouter
                  </button>
                  <button onClick={() => setShowNewProject(false)} className="px-2 py-1 text-xs border rounded hover:bg-gray-100">
                    <X size={12} />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowNewProject(true)}
                className="flex items-center gap-2 w-full px-3 py-1.5 rounded-md text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors"
              >
                <Plus size={14} />
                <span>Ajouter une équipe</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-200">
        <button className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
          Aide et ressources
        </button>
      </div>
    </aside>
  );
}

function NavItem({ icon, label, count, active, onClick, countColor = 'text-gray-400' }: {
  icon: React.ReactNode;
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
  countColor?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 w-full px-3 py-1.5 rounded-md text-sm transition-colors ${
        active ? 'bg-red-50 text-red-700 font-medium' : 'text-gray-600 hover:bg-gray-200'
      }`}
    >
      <span className={active ? 'text-red-500' : 'text-gray-400'}>{icon}</span>
      <span className="flex-1 text-left">{label}</span>
      {count !== undefined && count > 0 && (
        <span className={`text-xs font-medium ${active ? 'text-red-500' : countColor}`}>{count}</span>
      )}
    </button>
  );
}
