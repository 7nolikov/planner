import { Component, Show, Switch, Match } from 'solid-js';
import { YearView } from './components/YearView';
import { SprintDetailView } from './components/SprintDetailView';
import { WeekDetailView } from './components/WeekDetailView';
import { YearSelector } from './components/YearSelector';
import { EditModal } from './components/EditModal';
import { uiStore } from './stores/uiStore';
import { yearStore } from './stores/yearStore';
import { StorageService } from './services/StorageService';

const App: Component = () => {
  const handleClearAll = () => {
    const confirmed = window.confirm('Clear all saved planner data? This cannot be undone.');
    if (!confirmed) return;
    StorageService.clearAll();
    window.location.reload();
  };

  const handleExport = () => {
    const data = StorageService.exportAll();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shapeup-planner-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result as string);
          if (StorageService.importAll(data)) {
            window.location.reload();
          }
        } catch {
          alert('Invalid JSON file.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

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
          <YearSelector />
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

      <Show when={uiStore.activeView === 'year'}>
        <footer class="border-t border-surface-800 bg-surface-950/80 py-4">
          <div class="mx-auto flex max-w-[1800px] items-center justify-between px-4 lg:px-8">
            <div class="flex items-center gap-2">
              <button
                class="btn btn-ghost"
                onClick={() => yearStore.seedYearPattern()}
              >
                Fill year pattern
              </button>
              <button class="btn btn-ghost" onClick={handleExport}>
                Export data
              </button>
              <button class="btn btn-ghost" onClick={handleImport}>
                Import data
              </button>
            </div>
            <button
              class="btn btn-ghost text-rose-300 hover:bg-rose-500/10"
              onClick={handleClearAll}
            >
              Clear all data
            </button>
          </div>
        </footer>
      </Show>

      {uiStore.editModal.open && <EditModal />}
    </div>
  );
};

export default App;
