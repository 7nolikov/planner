import { Component, Show, createSignal, createEffect, onMount, onCleanup } from 'solid-js';
import { X, Save, Palette } from 'lucide-solid';
import { uiStore } from '../stores/uiStore';
import { sprintStore } from '../stores/sprintStore';
import { SPRINT_COLORS, SPRINT_COLOR_MAP, type SprintColor } from '../types';

export const EditModal: Component = () => {
  const [title, setTitle] = createSignal('');
  const [goalPitch, setGoalPitch] = createSignal('');
  const [colorTheme, setColorTheme] = createSignal<SprintColor>('azure');

  // Load data when modal opens
  createEffect(() => {
    if (uiStore.editModal.open && uiStore.editModal.type === 'sprint') {
      const sprint = sprintStore.getSprint(uiStore.editModal.targetId!);
      if (sprint) {
        setTitle(sprint.title);
        setGoalPitch(sprint.goalPitch);
        setColorTheme(sprint.colorTheme);
      }
    }
  });

  // Handle escape key
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  onMount(() => {
    document.addEventListener('keydown', handleKeyDown);
  });

  onCleanup(() => {
    document.removeEventListener('keydown', handleKeyDown);
  });

  const handleClose = () => {
    uiStore.closeEditModal();
  };

  const handleSave = () => {
    if (uiStore.editModal.type === 'sprint' && uiStore.editModal.targetId) {
      sprintStore.updateSprint(uiStore.editModal.targetId, {
        title: title(),
        goalPitch: goalPitch(),
        colorTheme: colorTheme(),
      });
    }
    handleClose();
  };

  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <div class="modal-overlay animate-fade-in" onClick={handleBackdropClick}>
      <div class="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold">Edit Sprint</h2>
          <button
            onClick={handleClose}
            class="p-2 text-surface-400 hover:text-white hover:bg-surface-800 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Sprint editing form */}
        <Show when={uiStore.editModal.type === 'sprint'}>
          <div class="space-y-5">
            {/* Title */}
            <div>
              <label class="block text-sm font-medium text-surface-300 mb-2">
                Sprint Title
              </label>
              <input
                type="text"
                value={title()}
                onInput={(e) => setTitle(e.currentTarget.value)}
                class="input"
                placeholder="e.g., Q1 Product Launch"
              />
            </div>

            {/* Color theme */}
            <div>
              <label class="block text-sm font-medium text-surface-300 mb-2">
                <span class="flex items-center gap-2">
                  <Palette size={14} />
                  Color Theme
                </span>
              </label>
              <div class="grid grid-cols-4 gap-2">
                {SPRINT_COLORS.map((color) => (
                  <button
                    onClick={() => setColorTheme(color)}
                    class={`h-10 rounded-lg border-2 transition-all ${
                      colorTheme() === color
                        ? `${SPRINT_COLOR_MAP[color].border} ring-2 ring-offset-2 ring-offset-surface-900 ring-${color}`
                        : 'border-surface-700 hover:border-surface-600'
                    }`}
                    style={{
                      'background-color': `var(--sprint-${color})`,
                      opacity: colorTheme() === color ? 1 : 0.5,
                    }}
                    title={color.charAt(0).toUpperCase() + color.slice(1)}
                  />
                ))}
              </div>
            </div>

            {/* Goal pitch */}
            <div>
              <label class="block text-sm font-medium text-surface-300 mb-2">
                Goal / Pitch
              </label>
              <textarea
                value={goalPitch()}
                onInput={(e) => setGoalPitch(e.currentTarget.value)}
                class="textarea h-32"
                placeholder="What's the main goal of this sprint? What will you ship?"
              />
              <p class="mt-1.5 text-xs text-surface-500">
                Use this to describe the bet you're making. What outcome matters most?
              </p>
            </div>

            {/* Actions */}
            <div class="flex justify-end gap-3 pt-4 border-t border-surface-800">
              <button onClick={handleClose} class="btn btn-ghost">
                Cancel
              </button>
              <button onClick={handleSave} class="btn btn-primary">
                <Save size={16} />
                Save Changes
              </button>
            </div>
          </div>
        </Show>
      </div>
    </div>
  );
};

