import { Component } from 'solid-js';
import { YearView } from './components/YearView';
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

  return (
    <div class="min-h-screen bg-surface-950">
      <header class="sticky top-0 z-40 border-b border-surface-800 bg-surface-950/80 backdrop-blur-md">
        <div class="mx-auto flex h-16 max-w-[1800px] items-center justify-between gap-4 px-4 lg:px-8">
          <h1 class="text-xl font-semibold tracking-tight">
            Shape Up Planner
          </h1>
          <YearSelector />
        </div>
      </header>

      <main class="mx-auto max-w-[1800px] p-4 lg:p-8">
        <YearView />
      </main>

      <footer class="border-t border-surface-800 bg-surface-950/80 py-4">
        <div class="mx-auto flex max-w-[1800px] items-center justify-between px-4 lg:px-8">
          <button
            class="btn btn-ghost"
            onClick={() => yearStore.seedYearPattern()}
          >
            Fill year pattern
          </button>
        </div>
        <div class="mx-auto flex max-w-[1800px] items-center justify-end px-4 lg:px-8">
          <button
            class="btn btn-ghost text-rose-300 hover:bg-rose-500/10"
            onClick={handleClearAll}
          >
            Clear all data
          </button>
        </div>
      </footer>

      {uiStore.editModal.open && <EditModal />}
    </div>
  );
};

export default App;
