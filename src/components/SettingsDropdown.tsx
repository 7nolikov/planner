import { Component, Show, createSignal, onMount, onCleanup } from 'solid-js';
import { Settings, Download, Upload, Trash2, LayoutGrid, ToggleLeft, ToggleRight } from 'lucide-solid';
import { yearStore } from '../stores/yearStore';
import { uiStore } from '../stores/uiStore';
import { StorageService } from '../services/StorageService';
import { CYCLE_MODE_INFO } from '../types';

export const SettingsDropdown: Component = () => {
  const [open, setOpen] = createSignal(false);
  let dropdownRef: HTMLDivElement | undefined;

  const handleClickOutside = (e: MouseEvent) => {
    if (dropdownRef && !dropdownRef.contains(e.target as Node)) {
      setOpen(false);
    }
  };

  onMount(() => {
    document.addEventListener('mousedown', handleClickOutside);
  });

  onCleanup(() => {
    document.removeEventListener('mousedown', handleClickOutside);
  });

  const handleToggleCycleMode = () => {
    const next = yearStore.cycleMode === '6-cycles' ? '8-cycles' : '6-cycles';
    yearStore.setCycleMode(next);
    uiStore.showToast(`Switched to ${CYCLE_MODE_INFO[next].label}`);
  };

  const handleSeedPattern = () => {
    yearStore.seedYearPattern();
    setOpen(false);
    const info = CYCLE_MODE_INFO[yearStore.cycleMode];
    uiStore.showToast(`${info.label} pattern applied`, {
      durationMs: 5000,
      action: { label: 'Undo', fn: () => yearStore.undo() },
    });
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
    setOpen(false);
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
    setOpen(false);
  };

  const handleClearAll = () => {
    const confirmed = window.confirm('Clear all saved planner data? This cannot be undone.');
    if (!confirmed) return;
    StorageService.clearAll();
    window.location.reload();
  };

  return (
    <div class="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open())}
        class="p-2 text-surface-400 hover:text-white hover:bg-surface-800 rounded-lg transition-colors"
        aria-label="Settings"
        title="Settings"
      >
        <Settings size={20} />
      </button>

      <Show when={open()}>
        <div class="absolute right-0 top-full mt-2 w-64 rounded-lg border border-surface-700 bg-surface-900 py-1 shadow-xl z-50 animate-fade-in">
          <button
            onClick={handleToggleCycleMode}
            class="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-surface-300 hover:bg-surface-800 hover:text-white transition-colors"
          >
            <Show when={yearStore.cycleMode === '6-cycles'} fallback={<ToggleLeft size={16} />}>
              <ToggleRight size={16} class="text-sprint-azure" />
            </Show>
            <div class="flex flex-col items-start">
              <span>{CYCLE_MODE_INFO[yearStore.cycleMode].label}</span>
              <span class="text-xs text-surface-500">{CYCLE_MODE_INFO[yearStore.cycleMode].description}</span>
            </div>
          </button>

          <button
            onClick={handleSeedPattern}
            class="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-surface-300 hover:bg-surface-800 hover:text-white transition-colors"
          >
            <LayoutGrid size={16} />
            Fill year pattern
          </button>

          <button
            onClick={handleExport}
            class="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-surface-300 hover:bg-surface-800 hover:text-white transition-colors"
          >
            <Download size={16} />
            Export data
          </button>

          <button
            onClick={handleImport}
            class="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-surface-300 hover:bg-surface-800 hover:text-white transition-colors"
          >
            <Upload size={16} />
            Import data
          </button>

          <div class="my-1 border-t border-surface-800" />

          <button
            onClick={handleClearAll}
            class="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-rose-300 hover:bg-rose-500/10 transition-colors"
          >
            <Trash2 size={16} />
            Clear all data
          </button>
        </div>
      </Show>
    </div>
  );
};
