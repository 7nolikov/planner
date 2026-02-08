import { Component, Switch, Match, onMount, onCleanup } from 'solid-js';
import { YearView } from './components/YearView';
import { SprintDetailView } from './components/SprintDetailView';
import { WeekDetailView } from './components/WeekDetailView';
import { YearSelector } from './components/YearSelector';
import { SettingsDropdown } from './components/SettingsDropdown';
import { EditModal } from './components/EditModal';
import { Toast } from './components/Toast';
import { uiStore } from './stores/uiStore';
import { yearStore } from './stores/yearStore';

const App: Component = () => {
  const isInputFocused = () => {
    const tag = document.activeElement?.tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA';
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
        <div class="mx-auto flex h-16 max-w-[1800px] items-center justify-between gap-4 px-4 lg:px-8">
          <button
            onClick={() => uiStore.navigateBack()}
            class="text-xl font-semibold tracking-tight hover:text-surface-300 transition-colors"
          >
            Shape Up Planner
          </button>
          <div class="flex items-center gap-2">
            <YearSelector />
            <SettingsDropdown />
          </div>
        </div>
      </header>

      <main class="mx-auto max-w-[1800px] p-4 lg:p-8">
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
