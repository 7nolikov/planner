import { createSignal, createRoot } from 'solid-js';
import { createStore } from 'solid-js/store';
import type { EditModalState, DragState } from '../types';

export type ViewType = 'year' | 'sprint' | 'week';

export const uiStore = createRoot(() => {
  // View navigation
  const [activeView, setActiveView] = createSignal<ViewType>('year');
  const [activeViewId, setActiveViewId] = createSignal<string | null>(null);

  // Track last viewed sprint/week for quick navigation
  const [lastSprintId, setLastSprintId] = createSignal<string | null>(null);
  const [lastWeekId, setLastWeekId] = createSignal<string | null>(null);

  // Edit modal state
  const [editModal, setEditModal] = createStore<EditModalState>({
    open: false,
    type: null,
    targetId: null,
  });

  // Drag state
  const [dragState, setDragState] = createStore<DragState>({
    isDragging: false,
    dragType: null,
    dragId: null,
    sourceWeekId: null,
  });

  // Drop target for visual feedback
  const [dropTargetId, setDropTargetId] = createSignal<string | null>(null);

  // Toast notification
  const [toastMessage, setToastMessage] = createSignal<string | null>(null);
  const [toastAction, setToastAction] = createSignal<{ label: string; fn: () => void } | null>(null);
  let toastTimer: ReturnType<typeof setTimeout> | undefined;

  // Quick add input state
  const [quickAddWeekId, setQuickAddWeekId] = createSignal<string | null>(null);

  function navigateTo(view: ViewType, id?: string): void {
    setActiveView(view);
    setActiveViewId(id ?? null);
    // Track last viewed IDs for quick navigation
    if (view === 'sprint' && id) setLastSprintId(id);
    if (view === 'week' && id) setLastWeekId(id);
  }

  function navigateBack(): void {
    setActiveView('year');
    setActiveViewId(null);
  }

  /**
   * Open the edit modal for a sprint
   */
  function openEditModal(type: 'sprint', targetId: string): void {
    setEditModal({
      open: true,
      type,
      targetId,
    });
  }

  /**
   * Close the edit modal
   */
  function closeEditModal(): void {
    setEditModal({
      open: false,
      type: null,
      targetId: null,
    });
  }

  /**
   * Start dragging
   */
  function startDrag(
    type: 'task',
    id: string,
    sourceWeekId: string | null = null
  ): void {
    setDragState({
      isDragging: true,
      dragType: type,
      dragId: id,
      sourceWeekId,
    });
  }

  /**
   * End dragging
   */
  function endDrag(): void {
    setDragState({
      isDragging: false,
      dragType: null,
      dragId: null,
      sourceWeekId: null,
    });
    setDropTargetId(null);
  }

  /**
   * Set drop target for visual feedback
   */
  function setDropTarget(weekId: string | null): void {
    setDropTargetId(weekId);
  }

  /**
   * Open quick add for a week
   */
  function openQuickAdd(weekId: string): void {
    setQuickAddWeekId(weekId);
  }

  /**
   * Close quick add
   */
  function closeQuickAdd(): void {
    setQuickAddWeekId(null);
  }

  /**
   * Show a toast message for a few seconds
   */
  function showToast(message: string, options?: { durationMs?: number; action?: { label: string; fn: () => void } }): void {
    if (toastTimer) clearTimeout(toastTimer);
    setToastMessage(message);
    setToastAction(options?.action ?? null);
    const duration = options?.durationMs ?? 3000;
    toastTimer = setTimeout(() => { setToastMessage(null); setToastAction(null); }, duration);
  }

  function dismissToast(): void {
    if (toastTimer) clearTimeout(toastTimer);
    setToastMessage(null);
    setToastAction(null);
  }

  return {
    // State (reactive)
    get activeView() { return activeView(); },
    get activeViewId() { return activeViewId(); },
    get editModal() { return editModal; },
    get dragState() { return dragState; },
    get dropTargetId() { return dropTargetId(); },
    get lastSprintId() { return lastSprintId(); },
    get lastWeekId() { return lastWeekId(); },
    get quickAddWeekId() { return quickAddWeekId(); },
    get toastMessage() { return toastMessage(); },
    get toastAction() { return toastAction(); },

    // Actions
    navigateTo,
    navigateBack,
    openEditModal,
    closeEditModal,
    startDrag,
    endDrag,
    setDropTarget,
    openQuickAdd,
    closeQuickAdd,
    showToast,
    dismissToast,
  };
});
