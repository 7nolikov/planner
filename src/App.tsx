import { Component } from 'solid-js';
import { YearView } from './components/YearView';
import { YearSelector } from './components/YearSelector';
import { EditModal } from './components/EditModal';
import { uiStore } from './stores/uiStore';

const App: Component = () => {
  return (
    <div class="min-h-screen bg-surface-950">
      <header class="sticky top-0 z-40 border-b border-surface-800 bg-surface-950/80 backdrop-blur-md">
        <div class="mx-auto flex h-16 max-w-[1800px] items-center justify-between px-4 lg:px-8">
          <h1 class="text-xl font-semibold tracking-tight">
            Shape Up Planner
          </h1>
          <YearSelector />
        </div>
      </header>

      <main class="mx-auto max-w-[1800px] p-4 lg:p-8">
        <YearView />
      </main>

      {uiStore.editModal.open && <EditModal />}
    </div>
  );
};

export default App;

