import { Component, Switch, Match, onMount, onCleanup } from 'solid-js';
import { YearView } from './components/YearView';
import { SprintDetailView } from './components/SprintDetailView';
import { WeekDetailView } from './components/WeekDetailView';
import { YearSelector } from './components/YearSelector';
import { ViewControls } from './components/ViewControls';
import { SettingsDropdown } from './components/SettingsDropdown';
import { EditModal } from './components/EditModal';
import { Toast } from './components/Toast';
import { uiStore } from './stores/uiStore';
import { yearStore } from './stores/yearStore';
import { sprintStore } from './stores/sprintStore';
import { YearGenerator } from './services/YearGenerator';

const App: Component = () => {
  const isInputFocused = () => {
    const tag = document.activeElement?.tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA';
  };

  const navigateToQuickSprint = () => {
    const currentWeekId = YearGenerator.getCurrentWeekId();
    // Try last viewed sprint
    const last = uiStore.lastSprintId;
    if (last && sprintStore.getSprint(last)) {
      uiStore.navigateTo('sprint', last);
      return;
    }
    // Try sprint containing current week
    const week = yearStore.getWeek(currentWeekId);
    if (week?.sprintId) {
      uiStore.navigateTo('sprint', week.sprintId);
      return;
    }
    // Fall back to first sprint
    const sorted = sprintStore.sortedSprints();
    if (sorted.length > 0) {
      uiStore.navigateTo('sprint', sorted[0].id);
    }
  };

  const navigateToQuickWeek = () => {
    const currentWeekId = YearGenerator.getCurrentWeekId();
    // Try last viewed week
    const last = uiStore.lastWeekId;
    if (last && yearStore.getWeek(last)) {
      uiStore.navigateTo('week', last);
      return;
    }
    // Fall back to current week
    const week = yearStore.getWeek(currentWeekId);
    if (week) {
      uiStore.navigateTo('week', currentWeekId);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    // Ctrl/Cmd+Z for undo
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      if (yearStore.undoLabel) {
        e.preventDefault();
        yearStore.undo();
        uiStore.showToast('Undone');
      }
      return;
    }

    // Skip shortcuts when editing text
    if (isInputFocused()) return;

    // View switching hotkeys: 1 = Year, 2 = Sprint, 3 = Week
    if (e.key === '1' && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      uiStore.navigateBack();
      return;
    }
    if (e.key === '2' && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      navigateToQuickSprint();
      return;
    }
    if (e.key === '3' && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      navigateToQuickWeek();
      return;
    }

    // Escape: navigate back or close modal
    if (e.key === 'Escape') {
      if (uiStore.editModal.open) return; // EditModal handles its own Escape
      if (uiStore.activeView !== 'year') {
        uiStore.navigateBack();
      }
      return;
    }

    // Arrow keys for year navigation (only on year view)
    if (uiStore.activeView === 'year') {
      if (e.key === 'ArrowLeft') {
        yearStore.setYear(yearStore.year - 1);
      } else if (e.key === 'ArrowRight') {
        yearStore.setYear(yearStore.year + 1);
      }
    }
  };

  onMount(() => {
    document.addEventListener('keydown', handleKeyDown);
  });

  onCleanup(() => {
    document.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <div class="min-h-screen bg-surface-950">
      <header class="sticky top-0 z-40 border-b border-surface-800 bg-surface-950/80 backdrop-blur-md">
        <div class="mx-auto flex h-14 max-w-[1800px] items-center justify-between gap-2 px-3 sm:h-16 sm:gap-4 sm:px-4 lg:px-8">
          <button
            onClick={() => uiStore.navigateBack()}
            class="text-base font-semibold tracking-tight hover:text-surface-300 transition-colors sm:text-xl shrink-0"
          >
            <span class="hidden xs:inline">Shape Up Planner</span>
            <span class="xs:hidden">SUP</span>
          </button>
          <ViewControls />
          <div class="flex items-center gap-1 sm:gap-2 shrink-0">
            <YearSelector />
            <SettingsDropdown />
          </div>
        </div>
      </header>

      <main class="mx-auto max-w-[1800px] p-3 sm:p-4 lg:p-8">
        <Switch>
          <Match when={uiStore.activeView === 'sprint'}>
            <SprintDetailView />
          </Match>
          <Match when={uiStore.activeView === 'week'}>
            <WeekDetailView />
          </Match>
          <Match when={uiStore.activeView === 'year'}>
            <YearView />
          </Match>
        </Switch>
      </main>

      {uiStore.editModal.open && <EditModal />}
      <Toast />
    </div>
  );
};

export default App;
