// Core data types for the Shape Up Planner

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  weekId: string;
}

export interface Week {
  id: string;           // Format: "2026-W01"
  weekNumber: number;   // 1-53
  year: number;
  startDate: string;    // ISO date string
  endDate: string;      // ISO date string
  isVacation: boolean;
  sprintId: string | null;
  tasks: Task[];
  order: number;        // For drag-and-drop reordering
}

export interface Sprint {
  id: string;
  title: string;
  goalPitch: string;    // Markdown content
  colorTheme: SprintColor;
  weekIds: string[];    // Exactly 6 week references
  year: number;
  order: number;        // Sprint order within year
}

export interface YearData {
  year: number;
  weeks: Week[];
  sprints: Sprint[];
  vacationWeekIds: string[];  // Max 5 vacation weeks
}

export type SprintColor = 
  | 'crimson'
  | 'amber'
  | 'emerald'
  | 'azure'
  | 'violet'
  | 'slate'
  | 'rose'
  | 'cyan';

export const SPRINT_COLORS: SprintColor[] = [
  'crimson',
  'amber',
  'emerald',
  'azure',
  'violet',
  'slate',
  'rose',
  'cyan',
];

export const SPRINT_COLOR_MAP: Record<SprintColor, { bg: string; border: string; text: string }> = {
  crimson: { bg: 'bg-sprint-crimson/10', border: 'border-sprint-crimson/30', text: 'text-sprint-crimson' },
  amber: { bg: 'bg-sprint-amber/10', border: 'border-sprint-amber/30', text: 'text-sprint-amber' },
  emerald: { bg: 'bg-sprint-emerald/10', border: 'border-sprint-emerald/30', text: 'text-sprint-emerald' },
  azure: { bg: 'bg-sprint-azure/10', border: 'border-sprint-azure/30', text: 'text-sprint-azure' },
  violet: { bg: 'bg-sprint-violet/10', border: 'border-sprint-violet/30', text: 'text-sprint-violet' },
  slate: { bg: 'bg-sprint-slate/10', border: 'border-sprint-slate/30', text: 'text-sprint-slate' },
  rose: { bg: 'bg-sprint-rose/10', border: 'border-sprint-rose/30', text: 'text-sprint-rose' },
  cyan: { bg: 'bg-sprint-cyan/10', border: 'border-sprint-cyan/30', text: 'text-sprint-cyan' },
};

export const MAX_VACATION_WEEKS = 5;
export const WEEKS_PER_SPRINT = 6;

// UI State types
export interface EditModalState {
  open: boolean;
  type: 'sprint' | null;
  targetId: string | null;
}

export interface DragState {
  isDragging: boolean;
  dragType: 'task' | null;
  dragId: string | null;
  sourceWeekId: string | null;
}

// Utility type for generating unique IDs
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
