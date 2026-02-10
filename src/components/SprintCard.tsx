import { Component, For, Show, createMemo, createSignal } from 'solid-js';
import { Edit3, Target, Trash2, Check } from 'lucide-solid';
import type { Sprint } from '../types';
import { SPRINT_COLOR_MAP } from '../types';
import { yearStore } from '../stores/yearStore';
import { sprintStore } from '../stores/sprintStore';
import { uiStore } from '../stores/uiStore';
import { WeekCell } from './WeekCell';

interface SprintCardProps {
  sprint: Sprint;
}

export const SprintCard: Component<SprintCardProps> = (props) => {
  const weeks = createMemo(() => {
    return props.sprint.weekIds
      .map((id) => yearStore.getWeek(id))
      .filter((w): w is NonNullable<typeof w> => w !== undefined);
  });

  const totalTasks = createMemo(() =>
    weeks().reduce((sum, w) => sum + w.tasks.length, 0)
  );

  const completedTasks = createMemo(() =>
    weeks().reduce((sum, w) => sum + w.tasks.filter((t) => t.completed).length, 0)
  );

  const progressPercent = createMemo(() =>
    totalTasks() === 0 ? 0 : Math.round((completedTasks() / totalTasks()) * 100)
  );

  const colorClasses = () => SPRINT_COLOR_MAP[props.sprint.colorTheme];

  // Inline title editing
  const [isEditingTitle, setIsEditingTitle] = createSignal(false);
  const [editTitleValue, setEditTitleValue] = createSignal('');

  const startTitleEdit = () => {
    setEditTitleValue(props.sprint.title);
    setIsEditingTitle(true);
  };

  const saveTitleEdit = () => {
    const value = editTitleValue().trim();
    if (value && value !== props.sprint.title) {
      sprintStore.updateSprint(props.sprint.id, { title: value });
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') saveTitleEdit();
    else if (e.key === 'Escape') setIsEditingTitle(false);
  };

  const handleEdit = () => {
    uiStore.openEditModal('sprint', props.sprint.id);
  };

  const handleDelete = () => {
    const title = props.sprint.title;
    sprintStore.deleteSprint(props.sprint.id);
    uiStore.showToast(`Deleted "${title}"`, {
      durationMs: 5000,
      action: { label: 'Undo', fn: () => yearStore.undo() },
    });
  };

  const handleOpenSprint = () => {
    uiStore.navigateTo('sprint', props.sprint.id);
  };

  const formatDateRange = () => {
    const firstWeek = weeks()[0];
    const lastWeek = weeks()[weeks().length - 1];
    if (!firstWeek || !lastWeek) return '';

    const start = new Date(firstWeek.startDate);
    const end = new Date(lastWeek.endDate);

    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  return (
    <div class={`sprint-card overflow-hidden ${colorClasses().border} border-l-4`}>
      {/* Header */}
      <div class={`${colorClasses().bg} px-4 py-3 border-b border-surface-800`}>
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <Target size={16} class={colorClasses().text} />
              <Show when={isEditingTitle()} fallback={
                <button
                  onClick={handleOpenSprint}
                  onDblClick={(e) => { e.stopPropagation(); startTitleEdit(); }}
                  class="font-semibold text-white truncate hover:underline text-left"
                  title="Click to view, double-click to rename"
                >
                  {props.sprint.title}
                </button>
              }>
                <input
                  type="text"
                  value={editTitleValue()}
                  onInput={(e) => setEditTitleValue(e.currentTarget.value)}
                  onBlur={saveTitleEdit}
                  onKeyDown={handleTitleKeyDown}
                  class="bg-transparent font-semibold text-white outline-none border-b border-surface-500 px-0 py-0 w-full"
                  autofocus
                />
              </Show>
            </div>
            <div class="mt-1 flex items-center gap-3">
              <span class="text-xs text-surface-400">
                {formatDateRange()} · 6 weeks
              </span>
              <Show when={totalTasks() > 0}>
                <span class="text-xs text-surface-400 flex items-center gap-1">
                  <Check size={10} />
                  {completedTasks()}/{totalTasks()}
                </span>
              </Show>
            </div>
          </div>

          <div class="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={handleEdit}
              class="p-1.5 text-surface-400 hover:text-white hover:bg-surface-700 rounded transition-colors"
              title="Edit sprint"
            >
              <Edit3 size={14} />
            </button>
            <button
              onClick={handleDelete}
              class="p-1.5 text-surface-400 hover:text-red-400 hover:bg-surface-700 rounded transition-colors"
              title="Delete sprint"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Goal pitch preview */}
        <Show when={props.sprint.goalPitch}>
          <p class="mt-2 text-sm text-surface-300 line-clamp-2">
            {props.sprint.goalPitch}
          </p>
        </Show>

        {/* Progress bar */}
        <Show when={totalTasks() > 0}>
          <div class="mt-3 h-1.5 rounded-full bg-surface-800/50 overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-300"
              style={{
                width: `${progressPercent()}%`,
                'background-color': `var(--sprint-${props.sprint.colorTheme})`,
              }}
            />
          </div>
        </Show>
      </div>

      {/* Weeks grid */}
      <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-px bg-surface-800">
        <For each={weeks()}>
          {(week, index) => (
            <div class="bg-surface-900">
              <WeekCell
                week={week}
                sprintColor={props.sprint.colorTheme}
                isFirst={index() === 0}
                isLast={index() === weeks().length - 1}
              />
            </div>
          )}
        </For>
      </div>
    </div>
  );
};
