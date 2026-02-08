import { Component, Show } from 'solid-js';
import { X } from 'lucide-solid';
import { uiStore } from '../stores/uiStore';

export const Toast: Component = () => {
  const handleAction = () => {
    const action = uiStore.toastAction;
    if (action) {
      action.fn();
      uiStore.dismissToast();
    }
  };

  return (
    <Show when={uiStore.toastMessage}>
      <div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
        <div class="flex items-center gap-3 rounded-lg border border-surface-700 bg-surface-900 px-4 py-3 shadow-xl">
          <span class="text-sm text-surface-200">{uiStore.toastMessage}</span>
          <Show when={uiStore.toastAction}>
            <button
              onClick={handleAction}
              class="rounded px-2 py-1 text-xs font-medium text-sprint-azure hover:bg-sprint-azure/20 transition-colors"
            >
              {uiStore.toastAction!.label}
            </button>
          </Show>
          <button
            onClick={() => uiStore.dismissToast()}
            class="p-1 text-surface-500 hover:text-white transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </Show>
  );
};
