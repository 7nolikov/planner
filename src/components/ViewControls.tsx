import { Component, createMemo, Show } from 'solid-js';
import { Calendar, Target, CalendarDays } from 'lucide-solid';
import { uiStore, ViewType } from '../stores/uiStore';
import { sprintStore } from '../stores/sprintStore';
import { yearStore } from '../stores/yearStore';
import { YearGenerator } from '../services/YearGenerator';

export const ViewControls: Component = () => {
  const currentWeekId = YearGenerator.getCurrentWeekId();

  // Determine the sprint to navigate to: last viewed, or sprint containing current week
  const targetSprintId = createMemo(() => {
    const last = uiStore.lastSprintId;
    if (last && sprintStore.getSprint(last)) return last;
    // Fall back to sprint containing current week
    const week = yearStore.getWeek(currentWeekId);
    if (week?.sprintId) return week.sprintId;
    // Fall back to first sprint
    const sorted = sprintStore.sortedSprints();
    return sorted.length > 0 ? sorted[0].id : null;
  });

  // Determine the week to navigate to: last viewed, or current week
  const targetWeekId = createMemo(() => {
    const last = uiStore.lastWeekId;
    if (last && yearStore.getWeek(last)) return last;
    // Fall back to current week
    const week = yearStore.getWeek(currentWeekId);
    return week ? currentWeekId : null;
  });

  // Sprint label for the button
  const sprintLabel = createMemo(() => {
    const id = targetSprintId();
    if (!id) return null;
    const s = sprintStore.getSprint(id);
    return s?.title ?? null;
  });

  // Week label for the button
  const weekLabel = createMemo(() => {
    const id = targetWeekId();
    if (!id) return null;
    const w = yearStore.getWeek(id);
    return w ? `W${w.weekNumber}` : null;
  });

  const handleNavigate = (view: ViewType) => {
    if (view === 'year') {
      uiStore.navigateBack();
    } else if (view === 'sprint') {
      const id = targetSprintId();
      if (id) uiStore.navigateTo('sprint', id);
    } else if (view === 'week') {
      const id = targetWeekId();
      if (id) uiStore.navigateTo('week', id);
    }
  };

  const isActive = (view: ViewType) => uiStore.activeView === view;

  return (
    <nav class="view-controls" role="tablist" aria-label="View switcher">
      {/* Year */}
      <button
        role="tab"
        aria-selected={isActive('year')}
        onClick={() => handleNavigate('year')}
        class="view-controls__tab"
        classList={{ 'view-controls__tab--active': isActive('year') }}
        title="Year view (1)"
      >
        <Calendar size={16} />
        <span class="view-controls__label">Year</span>
        <kbd class="view-controls__kbd">1</kbd>
      </button>

      {/* Sprint */}
      <Show when={targetSprintId()}>
        <button
          role="tab"
          aria-selected={isActive('sprint')}
          onClick={() => handleNavigate('sprint')}
          class="view-controls__tab"
          classList={{ 'view-controls__tab--active': isActive('sprint') }}
          title={`Sprint view (2)${sprintLabel() ? ` – ${sprintLabel()}` : ''}`}
        >
          <Target size={16} />
          <span class="view-controls__label">
            <span class="hidden sm:inline">{sprintLabel() ?? 'Sprint'}</span>
            <span class="sm:hidden">Sprint</span>
          </span>
          <kbd class="view-controls__kbd">2</kbd>
        </button>
      </Show>

      {/* Week */}
      <Show when={targetWeekId()}>
        <button
          role="tab"
          aria-selected={isActive('week')}
          onClick={() => handleNavigate('week')}
          class="view-controls__tab"
          classList={{ 'view-controls__tab--active': isActive('week') }}
          title={`Week view (3)${weekLabel() ? ` – ${weekLabel()}` : ''}`}
        >
          <CalendarDays size={16} />
          <span class="view-controls__label">{weekLabel() ?? 'Week'}</span>
          <kbd class="view-controls__kbd">3</kbd>
        </button>
      </Show>
    </nav>
  );
};
