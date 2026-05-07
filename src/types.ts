export type Priority = 1 | 2 | 3 | 4;

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  emoji?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: Priority;
  dueDate: string | null; // ISO date string yyyy-MM-dd
  projectId: string | null;
  labelIds: string[];
  parentId: string | null;   // subtask parent
  // Dependencies: this task depends on these task ids (must be done first)
  dependsOn: string[];
  // Dependencies: this task blocks these task ids
  blocks: string[];
  createdAt: string;
  completedAt: string | null;
  order: number;
}

export type View = 'inbox' | 'today' | 'upcoming' | 'filters' | 'reports' | 'project';

export interface AppState {
  tasks: Task[];
  projects: Project[];
  labels: Label[];
  selectedView: View;
  selectedProjectId: string | null;
  selectedTaskId: string | null;
}
