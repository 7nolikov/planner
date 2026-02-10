import { Component, For, Show, createMemo, createSignal } from 'solid-js';
import { ArrowLeft, ArrowRight, ChevronUp, Plus, Target, Palmtree, Check } from 'lucide-solid';
import { yearStore } from '../stores/yearStore';
import { sprintStore } from '../stores/sprintStore';
import { uiStore } from '../stores/uiStore';
import { DragDropManager } from '../services/DragDropManager';
import { YearGenerator } from '../services/YearGenerator';
import { SPRINT_COLOR_MAP } from '../types';
import { TaskItem } from './TaskItem';

export const WeekDetailView: Component = () => {
  const [newTaskTitle, setNewTaskTitle] = createSignal('');

  const week = createMemo(() => {
    const id = uiStore.activeViewId;
    return id ? yearStore.getWeek(id) : undefined;
  });

  const sprint = createMemo(() => {
    const w = week();
    return w?.sprintId ? sprintStore.getSprint(w.sprintId) : undefined;
  });

  const weekNavigation = createMemo(() => {
    const w = week();
    const weeks = yearStore.weeks;
    if (!w || weeks.length === 0) return { previousId: null as string | null, nextId: null as string | null };
    const index = weeks.findIndex((item) => item.id === w.id);
    if (index === -1) return { previousId: null as string | null, nextId: null as string | null };
    return {
      previousId: index > 0 ? weeks[index - 1].id : null,
      nextId: index < weeks.length - 1 ? weeks[index + 1].id : null,
    };
  });

  const isCurrentWeek = createMemo(() => {
    const w = week();
    return w ? w.id === YearGenerator.getCurrentWeekId() : false;
  });

  const completedCount = createMemo(() => week()?.tasks.filter((t) => t.completed).length ?? 0);
  const totalCount = createMemo(() => week()?.tasks.length ?? 0);
  const progressPercent = createMemo(() =>
    totalCount() === 0 ? 0 : Math.round((completedCount() / totalCount()) * 100)
  );

  const formatFullDateRange = () => {
    const w = week();
    if (!w) return '';
    const start = new Date(w.startDate);
    const end = new Date(w.endDate);
    return `${start.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}`;
  };

  const handleAddTask = () => {
    const w = week();
    const title = newTaskTitle().trim();
    if (w && title) {
      yearStore.addTask(w.id, title);
      setNewTaskTitle('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') handleAddTask();
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    const w = week();
    if (w && uiStore.dragState.isDragging && uiStore.dragState.dragType === 'task') {
      uiStore.setDropTarget(w.id);
      DragDropManager.handleDragOver(e);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    const w = week();
    const dragData = e.dataTransfer ? DragDropManager.parseDragData(e.dataTransfer) : null;
    if (w && dragData && dragData.type === 'task' && dragData.sourceWeekId) {
      yearStore.moveTask(dragData.id, dragData.sourceWeekId, w.id);
    }
    uiStore.endDrag();
  };

  const handleNavigateUp = () => {
    const s = sprint();
    if (s) {
      uiStore.navigateTo('sprint', s.id);
    } else {
      uiStore.navigateBack();
    }
  };

  const colorClasses = createMemo(() => {
    const s = sprint();
    return s ? SPRINT_COLOR_MAP[s.colorTheme] : null;
  });

  return (
    <Show when={week()} fallback={<div class="text-surface-500 text-center py-12">Week not found</div>}>
      <div
        class="space-y-6 animate-fade-in"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Header */}
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="flex items-start gap-4">
            <button
              onClick={handleNavigateUp}
              class="mt-1 p-2 text-surface-400 hover:text-white hover:bg-surface-800 rounded-lg transition-colors"
              title="Up"
            >
              <ChevronUp size={20} />
            </button>
            <div class="flex-1 min-w-0">
            <div class="flex items-center gap-3">
              <h2 class={`text-2xl font-bold ${isCurrentWeek() ? 'text-sprint-azure' : 'text-white'}`}>
                Week {week()!.weekNumber}
                {isCurrentWeek() && <span class="ml-2 text-base font-normal text-sprint-azure">· Current Week</span>}
              </h2>
            </div>
            <p class="mt-1 text-sm text-surface-400">{formatFullDateRange()}</p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button
              onClick={() => {
                const id = weekNavigation().previousId;
                if (id) uiStore.navigateTo('week', id);
              }}
              disabled={!weekNavigation().previousId}
              class="btn btn-ghost disabled:opacity-40 disabled:cursor-not-allowed"
              title="Previous week"
            >
              <ArrowLeft size={16} />
              Previous
            </button>
            <button
              onClick={() => {
                const id = weekNavigation().nextId;
                if (id) uiStore.navigateTo('week', id);
              }}
              disabled={!weekNavigation().nextId}
              class="btn btn-ghost disabled:opacity-40 disabled:cursor-not-allowed"
              title="Next week"
            >
              Next
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Sprint membership / vacation badge */}
        <Show when={sprint()}>
          <button
            onClick={() => uiStore.navigateTo('sprint', sprint()!.id)}
            class={`inline-flex items-center gap-2 rounded-lg ${colorClasses()!.bg} border ${colorClasses()!.border} px-3 py-2 text-sm transition-colors hover:opacity-80`}
          >
            <Target size={14} class={colorClasses()!.text} />
            <span class={colorClasses()!.text}>{sprint()!.title}</span>
          </button>
        </Show>

        <Show when={week()!.isVacation}>
          <div class="inline-flex items-center gap-2 rounded-lg bg-vacation/10 border border-vacation/30 px-3 py-2 text-sm text-vacation">
            <Palmtree size={14} />
            <span>Vacation Week</span>
          </div>
        </Show>

        {/* Progress */}
        <Show when={totalCount() > 0}>
          <div class="rounded-lg border border-surface-800 bg-surface-900 p-4">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-surface-300">Task Progress</span>
              <span class="text-sm text-surface-400">
                {completedCount()}/{totalCount()} completed · {progressPercent()}%
              </span>
            </div>
            <div class="h-2 rounded-full bg-surface-800 overflow-hidden">
              <div
                class="h-full rounded-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${progressPercent()}%` }}
              />
            </div>
          </div>
        </Show>

        {/* Add task */}
        <Show when={!week()!.isVacation}>
          <div class="flex gap-2">
            <input
              type="text"
              placeholder="Add a new task..."
              value={newTaskTitle()}
              onInput={(e) => setNewTaskTitle(e.currentTarget.value)}
              onKeyDown={handleKeyDown}
              class="input flex-1"
            />
            <button
              onClick={handleAddTask}
              disabled={!newTaskTitle().trim()}
              class="btn btn-primary"
            >
              <Plus size={16} />
              Add
            </button>
          </div>
        </Show>

        {/* Tasks */}
        <div class="rounded-lg border border-surface-800 bg-surface-900 overflow-hidden">
          <Show when={week()!.tasks.length > 0} fallback={
            <div class="p-8 text-center">
              <Check size={32} class="mx-auto text-surface-600 mb-3" />
              <p class="text-sm text-surface-500">
                {week()!.isVacation ? 'Enjoy your vacation!' : 'No tasks yet. Add one above to get started.'}
              </p>
            </div>
          }>
            <div class="divide-y divide-surface-800">
              <For each={week()!.tasks}>
                {(task) => (
                  <div class="px-4 py-2">
                    <TaskItem task={task} weekId={week()!.id} />
                  </div>
                )}
              </For>
            </div>
          </Show>
        </div>
      </div>
    </Show>
  );
};
