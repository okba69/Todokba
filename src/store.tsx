import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { AppState, Task, Project, Label, View, Priority } from './types';
import { format } from 'date-fns';

const STORAGE_KEY = 'todokba_state';

const defaultProjects: Project[] = [
  { id: 'p_gettingstarted', name: 'Getting Started', color: '#6366f1', emoji: '👋' },
];

const defaultLabels: Label[] = [
  { id: 'l_work', name: 'Travail', color: '#ef4444' },
  { id: 'l_personal', name: 'Personnel', color: '#3b82f6' },
  { id: 'l_urgent', name: 'Urgent', color: '#f97316' },
];

const today = format(new Date(), 'yyyy-MM-dd');

const defaultTasks: Task[] = [
  {
    id: 't1', title: 'Bienvenue dans Todokba !', description: 'Clique sur une tâche pour voir ses détails.', completed: false,
    priority: 4, dueDate: today, projectId: null, labelIds: [], parentId: null, dependsOn: [], blocks: ['t2'],
    createdAt: new Date().toISOString(), completedAt: null, order: 0,
  },
  {
    id: 't2', title: 'Créer ton premier projet', description: 'Utilise le bouton + dans la sidebar pour créer un projet.', completed: false,
    priority: 3, dueDate: today, projectId: null, labelIds: ['l_work'], parentId: null, dependsOn: ['t1'], blocks: [],
    createdAt: new Date().toISOString(), completedAt: null, order: 1,
  },
  {
    id: 't3', title: 'Essaie les dépendances entre tâches', description: 'Ouvre le détail d\'une tâche et utilise l\'onglet "Dépendances" pour lier des tâches.', completed: false,
    priority: 2, dueDate: null, projectId: null, labelIds: [], parentId: null, dependsOn: [], blocks: [],
    createdAt: new Date().toISOString(), completedAt: null, order: 2,
  },
];

const initialState: AppState = {
  tasks: defaultTasks,
  projects: defaultProjects,
  labels: defaultLabels,
  selectedView: 'inbox',
  selectedProjectId: null,
  selectedTaskId: null,
};

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...initialState, ...JSON.parse(raw) };
  } catch {}
  return initialState;
}

type Action =
  | { type: 'ADD_TASK'; task: Task }
  | { type: 'UPDATE_TASK'; id: string; patch: Partial<Task> }
  | { type: 'DELETE_TASK'; id: string }
  | { type: 'TOGGLE_TASK'; id: string }
  | { type: 'ADD_PROJECT'; project: Project }
  | { type: 'DELETE_PROJECT'; id: string }
  | { type: 'ADD_LABEL'; label: Label }
  | { type: 'SET_VIEW'; view: View; projectId?: string }
  | { type: 'SELECT_TASK'; id: string | null }
  | { type: 'ADD_DEPENDENCY'; taskId: string; dependsOnId: string }
  | { type: 'REMOVE_DEPENDENCY'; taskId: string; dependsOnId: string };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.task] };

    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t => t.id === action.id ? { ...t, ...action.patch } : t),
      };

    case 'DELETE_TASK': {
      const id = action.id;
      return {
        ...state,
        selectedTaskId: state.selectedTaskId === id ? null : state.selectedTaskId,
        tasks: state.tasks
          .filter(t => t.id !== id)
          .map(t => ({
            ...t,
            dependsOn: t.dependsOn.filter(d => d !== id),
            blocks: t.blocks.filter(b => b !== id),
          })),
      };
    }

    case 'TOGGLE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === action.id
            ? { ...t, completed: !t.completed, completedAt: !t.completed ? new Date().toISOString() : null }
            : t
        ),
      };

    case 'ADD_PROJECT':
      return { ...state, projects: [...state.projects, action.project] };

    case 'DELETE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter(p => p.id !== action.id),
        tasks: state.tasks.map(t => t.projectId === action.id ? { ...t, projectId: null } : t),
      };

    case 'ADD_LABEL':
      return { ...state, labels: [...state.labels, action.label] };

    case 'SET_VIEW':
      return {
        ...state,
        selectedView: action.view,
        selectedProjectId: action.projectId ?? null,
        selectedTaskId: null,
      };

    case 'SELECT_TASK':
      return { ...state, selectedTaskId: action.id };

    case 'ADD_DEPENDENCY': {
      const { taskId, dependsOnId } = action;
      if (taskId === dependsOnId) return state;
      return {
        ...state,
        tasks: state.tasks.map(t => {
          if (t.id === taskId && !t.dependsOn.includes(dependsOnId))
            return { ...t, dependsOn: [...t.dependsOn, dependsOnId] };
          if (t.id === dependsOnId && !t.blocks.includes(taskId))
            return { ...t, blocks: [...t.blocks, taskId] };
          return t;
        }),
      };
    }

    case 'REMOVE_DEPENDENCY': {
      const { taskId, dependsOnId } = action;
      return {
        ...state,
        tasks: state.tasks.map(t => {
          if (t.id === taskId)
            return { ...t, dependsOn: t.dependsOn.filter(d => d !== dependsOnId) };
          if (t.id === dependsOnId)
            return { ...t, blocks: t.blocks.filter(b => b !== taskId) };
          return t;
        }),
      };
    }

    default:
      return state;
  }
}

interface StoreContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  createTask: (partial: Partial<Task>) => Task;
  isTaskBlocked: (taskId: string) => boolean;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  useEffect(() => {
    const { selectedTaskId, selectedView, selectedProjectId, ...persistable } = state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...persistable }));
  }, [state]);

  function createTask(partial: Partial<Task>): Task {
    return {
      id: `t_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      title: '',
      description: '',
      completed: false,
      priority: 4,
      dueDate: null,
      projectId: null,
      labelIds: [],
      parentId: null,
      dependsOn: [],
      blocks: [],
      createdAt: new Date().toISOString(),
      completedAt: null,
      order: state.tasks.length,
      ...partial,
    };
  }

  function isTaskBlocked(taskId: string): boolean {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task || task.dependsOn.length === 0) return false;
    return task.dependsOn.some(depId => {
      const dep = state.tasks.find(t => t.id === depId);
      return dep && !dep.completed;
    });
  }

  return (
    <StoreContext.Provider value={{ state, dispatch, createTask, isTaskBlocked }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}

export function priorityColor(p: Priority): string {
  return { 1: '#db4035', 2: '#ff9a14', 3: '#4073ff', 4: '#808080' }[p];
}

export function priorityLabel(p: Priority): string {
  return { 1: 'P1', 2: 'P2', 3: 'P3', 4: 'P4' }[p];
}

export const PROJECT_COLORS = ['#6366f1', '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899'];
