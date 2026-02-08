import { Component, createSignal, For, Show } from 'solid-js';
import { Plus, Palmtree, Calendar } from 'lucide-solid';
import type { Week } from '../types';
import { MAX_VACATION_WEEKS, SPRINT_COLOR_MAP, type SprintColor } from '../types';
import { yearStore } from '../stores/yearStore';
import { sprintStore } from '../stores/sprintStore';
import { uiStore } from '../stores/uiStore';
import { DragDropManager } from '../services/DragDropManager';
import { YearGenerator } from '../services/YearGenerator';
import { TaskItem } from './TaskItem';
import { VacationBadge } from './VacationBadge';

interface WeekCellProps {
  week: Week;
  sprintColor?: SprintColor;
  isFirst?: boolean;
  isLast?: boolean;
}

export const WeekCell: Component<WeekCellProps> = (props) => {
  const [isAddingTask, setIsAddingTask] = createSignal(false);
  const [newTaskTitle, setNewTaskTitle] = createSignal('');

  const isCurrentWeek = () => props.week.id === YearGenerator.getCurrentWeekId();

  const colorClasses = () => {
    if (props.sprintColor) {
      return SPRINT_COLOR_MAP[props.sprintColor];
    }
    return null;
  };

  const formatDateRange = () => {
    const start = new Date(props.week.startDate);
    const end = new Date(props.week.endDate);
    const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${startStr} - ${endStr}`;
  };

  const handleVacationToggle = () => {
    if (!props.week.sprintId) {
      yearStore.toggleVacation(props.week.id);
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    if (uiStore.dragState.isDragging && uiStore.dragState.dragType === 'task') {
      uiStore.setDropTarget(props.week.id);
      DragDropManager.handleDragOver(e);
    }
  };

  const handleDragLeave = () => {
    if (uiStore.dropTargetId === props.week.id) {
      uiStore.setDropTarget(null);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    const dragData = e.dataTransfer ? DragDropManager.parseDragData(e.dataTransfer) : null;
    
    if (dragData && dragData.type === 'task' && dragData.sourceWeekId) {
      yearStore.moveTask(dragData.id, dragData.sourceWeekId, props.week.id);
    }
    
    uiStore.endDrag();
  };

  const handleAddTask = () => {
    const title = newTaskTitle().trim();
    if (title) {
      yearStore.addTask(props.week.id, title);
      setNewTaskTitle('');
    }
    setIsAddingTask(false);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTask();
    } else if (e.key === 'Escape') {
      setIsAddingTask(false);
      setNewTaskTitle('');
    }
  };

  const handleCreateSprint = () => {
    sprintStore.createSprint(props.week.id);
  };

  const isDropTarget = () => uiStore.dropTargetId === props.week.id;

  return (
    <div
      class={`week-cell flex flex-col ${props.week.isVacation ? 'vacation' : ''} ${
        isDropTarget() ? 'drop-target' : ''
      } ${isCurrentWeek() ? 'current-week' : ''} ${colorClasses()?.bg ?? ''} ${colorClasses()?.border ? `border-l-2 ${colorClasses()?.border}` : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Header */}
      <div class="mb-2 flex items-start justify-between">
        <div class="flex flex-col">
          <span class={`text-xs font-medium ${isCurrentWeek() ? 'text-sprint-azure' : 'text-surface-400'}`}>
            W{props.week.weekNumber}
            {isCurrentWeek() && <span class="ml-1 text-sprint-azure">· Now</span>}
          </span>
          <span class="text-xs text-surface-500">{formatDateRange()}</span>
        </div>
        
        <Show when={props.week.isVacation}>
          <VacationBadge />
        </Show>
      </div>

      {/* Tasks */}
      <div class="flex-1 space-y-1.5">
        <For each={props.week.tasks}>
          {(task) => <TaskItem task={task} weekId={props.week.id} />}
        </For>
      </div>

      {/* Quick add */}
      <Show when={isAddingTask()}>
        <div class="mt-2">
          <input
            type="text"
            placeholder="Task title..."
            value={newTaskTitle()}
            onInput={(e) => setNewTaskTitle(e.currentTarget.value)}
            onBlur={handleAddTask}
            onKeyDown={handleKeyDown}
            class="input text-sm"
            autofocus
          />
        </div>
      </Show>

      {/* Actions */}
      <div class="mt-2 flex items-center gap-1 pt-2 border-t border-surface-800">
        <Show when={!props.week.isVacation && !props.week.sprintId}>
          <button
            onClick={handleCreateSprint}
            class="flex items-center gap-1 rounded px-2 py-1 text-xs text-surface-500 hover:bg-surface-800 hover:text-surface-300 transition-colors"
            title="Start 6-week sprint from here"
          >
            <Calendar size={12} />
            <span>Start Sprint</span>
          </button>
        </Show>

        <Show when={!props.week.sprintId && !props.week.isVacation}>
          <button
            onClick={handleVacationToggle}
            disabled={!yearStore.canAddVacation()}
            class={`flex items-center gap-1 rounded px-2 py-1 text-xs transition-colors ${
              yearStore.canAddVacation()
                ? 'text-surface-500 hover:bg-vacation/20 hover:text-vacation'
                : 'text-surface-600 cursor-not-allowed opacity-50'
            }`}
            title={yearStore.canAddVacation()
              ? `Set as vacation (${yearStore.vacationCount()}/${MAX_VACATION_WEEKS} used)`
              : `Vacation limit reached (${MAX_VACATION_WEEKS}/${MAX_VACATION_WEEKS})`}
          >
            <Palmtree size={12} />
          </button>
        </Show>

        <Show when={props.week.isVacation}>
          <button
            onClick={handleVacationToggle}
            class="flex items-center gap-1 rounded px-2 py-1 text-xs text-vacation hover:bg-vacation/20 transition-colors"
            title="Remove vacation"
          >
            <Palmtree size={12} />
            <span>Remove</span>
          </button>
        </Show>

        <div class="flex-1" />

        <Show when={!props.week.isVacation}>
          <button
            onClick={() => setIsAddingTask(true)}
            class="flex items-center gap-1 rounded px-2 py-1 text-xs text-surface-500 hover:bg-surface-800 hover:text-surface-300 transition-colors"
            title="Add task"
          >
            <Plus size={12} />
          </button>
        </Show>
      </div>
    </div>
  );
};
