import { Component, For, Show, createMemo, createSignal } from 'solid-js';
import { ArrowLeft, Edit3, Target, Plus, Check } from 'lucide-solid';
import type { Week } from '../types';
import { SPRINT_COLOR_MAP } from '../types';
import { yearStore } from '../stores/yearStore';
import { sprintStore } from '../stores/sprintStore';
import { uiStore } from '../stores/uiStore';
import { YearGenerator } from '../services/YearGenerator';
import { TaskItem } from './TaskItem';

export const SprintDetailView: Component = () => {
  const sprint = createMemo(() => {
    const id = uiStore.activeViewId;
    return id ? sprintStore.getSprint(id) : undefined;
  });

  const weeks = createMemo(() => {
    const s = sprint();
    if (!s) return [];
    return s.weekIds
      .map((id) => yearStore.getWeek(id))
      .filter((w): w is Week => w !== undefined);
  });

  const currentWeekId = YearGenerator.getCurrentWeekId();

  const totalTasks = createMemo(() =>
    weeks().reduce((sum, w) => sum + w.tasks.length, 0)
  );

  const completedTasks = createMemo(() =>
    weeks().reduce((sum, w) => sum + w.tasks.filter((t) => t.completed).length, 0)
  );

  const progressPercent = createMemo(() =>
    totalTasks() === 0 ? 0 : Math.round((completedTasks() / totalTasks()) * 100)
  );

  const colorClasses = createMemo(() => {
    const s = sprint();
    return s ? SPRINT_COLOR_MAP[s.colorTheme] : SPRINT_COLOR_MAP.azure;
  });

  // Inline title editing
  const [isEditingTitle, setIsEditingTitle] = createSignal(false);
  const [editTitleValue, setEditTitleValue] = createSignal('');

  const startTitleEdit = () => {
    const s = sprint();
    if (s) {
      setEditTitleValue(s.title);
      setIsEditingTitle(true);
    }
  };

  const saveTitleEdit = () => {
    const s = sprint();
    const value = editTitleValue().trim();
    if (s && value && value !== s.title) {
      sprintStore.updateSprint(s.id, { title: value });
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') saveTitleEdit();
    else if (e.key === 'Escape') setIsEditingTitle(false);
  };

  const formatDateRange = () => {
    const w = weeks();
    if (w.length === 0) return '';
    const start = new Date(w[0].startDate);
    const end = new Date(w[w.length - 1].endDate);
    return `${start.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
  };

  return (
    <Show when={sprint()} fallback={<div class="text-surface-500 text-center py-12">Sprint not found</div>}>
      <div class="space-y-6 animate-fade-in">
        {/* Header */}
        <div class="flex items-start gap-4">
          <button
            onClick={() => uiStore.navigateBack()}
            class="mt-1 p-2 text-surface-400 hover:text-white hover:bg-surface-800 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-3">
              <Target size={20} class={colorClasses().text} />
              <Show when={isEditingTitle()} fallback={
                <h2
                  class="text-2xl font-bold text-white truncate cursor-text hover:opacity-80"
                  onClick={startTitleEdit}
                  title="Click to rename"
                >
                  {sprint()!.title}
                </h2>
              }>
                <input
                  type="text"
                  value={editTitleValue()}
                  onInput={(e) => setEditTitleValue(e.currentTarget.value)}
                  onBlur={saveTitleEdit}
                  onKeyDown={handleTitleKeyDown}
                  class="bg-transparent text-2xl font-bold text-white outline-none border-b border-surface-500 w-full"
                  autofocus
                />
              </Show>
              <button
                onClick={() => uiStore.openEditModal('sprint', sprint()!.id)}
                class="p-1.5 text-surface-400 hover:text-white hover:bg-surface-700 rounded transition-colors flex-shrink-0"
                title="Edit sprint details"
              >
                <Edit3 size={16} />
              </button>
            </div>
            <p class="mt-1 text-sm text-surface-400">{formatDateRange()}</p>
          </div>
        </div>

        {/* Goal pitch */}
        <Show when={sprint()!.goalPitch}>
          <div class={`${colorClasses().bg} rounded-lg border ${colorClasses().border} p-4`}>
            <p class="text-sm text-surface-200 whitespace-pre-wrap">{sprint()!.goalPitch}</p>
          </div>
        </Show>

        {/* Progress */}
        <div class="rounded-lg border border-surface-800 bg-surface-900 p-4">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-surface-300">Sprint Progress</span>
            <span class="text-sm text-surface-400">
              {completedTasks()}/{totalTasks()} tasks · {progressPercent()}%
            </span>
          </div>
          <div class="h-2 rounded-full bg-surface-800 overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-300"
              style={{
                width: `${progressPercent()}%`,
                'background-color': `var(--sprint-${sprint()!.colorTheme})`,
              }}
            />
          </div>
        </div>

        {/* Weeks */}
        <div class="space-y-4">
          <For each={weeks()}>
            {(week) => (
              <WeekDetailRow
                week={week}
                isCurrent={week.id === currentWeekId}
                sprintColor={sprint()!.colorTheme}
              />
            )}
          </For>
        </div>
      </div>
    </Show>
  );
};

interface WeekDetailRowProps {
  week: Week;
  isCurrent: boolean;
  sprintColor: string;
}

const WeekDetailRow: Component<WeekDetailRowProps> = (props) => {
  const [isAddingTask, setIsAddingTask] = createSignal(false);
  const [newTaskTitle, setNewTaskTitle] = createSignal('');

  const completedCount = createMemo(() => props.week.tasks.filter((t) => t.completed).length);
  const totalCount = createMemo(() => props.week.tasks.length);

  const formatDateRange = () => {
    const start = new Date(props.week.startDate);
    const end = new Date(props.week.endDate);
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
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
    if (e.key === 'Enter') handleAddTask();
    else if (e.key === 'Escape') {
      setIsAddingTask(false);
      setNewTaskTitle('');
    }
  };

  return (
    <div class={`rounded-lg border bg-surface-900 p-4 ${props.isCurrent ? 'border-sprint-azure/50 ring-1 ring-sprint-azure/30' : 'border-surface-800'}`}>
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-3">
          <button
            onClick={() => uiStore.navigateTo('week', props.week.id)}
            class="hover:underline"
          >
            <span class={`text-sm font-semibold ${props.isCurrent ? 'text-sprint-azure' : 'text-white'}`}>
              Week {props.week.weekNumber}
              {props.isCurrent && <span class="ml-1.5 text-sprint-azure font-normal">· Now</span>}
            </span>
          </button>
          <span class="text-xs text-surface-500">{formatDateRange()}</span>
        </div>
        <div class="flex items-center gap-3">
          <Show when={totalCount() > 0}>
            <span class="text-xs text-surface-400">
              <Check size={12} class="inline mr-1" />
              {completedCount()}/{totalCount()}
            </span>
          </Show>
          <button
            onClick={() => setIsAddingTask(true)}
            class="p-1 text-surface-500 hover:text-white hover:bg-surface-800 rounded transition-colors"
            title="Add task"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      <Show when={isAddingTask()}>
        <div class="mb-3">
          <input
            type="text"
            placeholder="New task..."
            value={newTaskTitle()}
            onInput={(e) => setNewTaskTitle(e.currentTarget.value)}
            onBlur={handleAddTask}
            onKeyDown={handleKeyDown}
            class="input text-sm"
            autofocus
          />
        </div>
      </Show>

      <Show when={props.week.tasks.length > 0} fallback={
        <p class="text-xs text-surface-600 italic">No tasks yet</p>
      }>
        <div class="space-y-1.5">
          <For each={props.week.tasks}>
            {(task) => <TaskItem task={task} weekId={props.week.id} />}
          </For>
        </div>
      </Show>
    </div>
  );
};
