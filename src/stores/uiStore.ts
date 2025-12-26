import { createSignal, createRoot } from 'solid-js';
import { createStore } from 'solid-js/store';
import type { EditModalState, DragState } from '../types';

export const uiStore = createRoot(() => {
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

  // Quick add input state
  const [quickAddWeekId, setQuickAddWeekId] = createSignal<string | null>(null);

  /**
   * Open the edit modal for a sprint or week
   */
  function openEditModal(type: 'sprint' | 'week', targetId: string): void {
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
    type: 'task' | 'week',
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


  return {
    // State (reactive)
    get editModal() { return editModal; },
    get dragState() { return dragState; },
    get dropTargetId() { return dropTargetId(); },
    get quickAddWeekId() { return quickAddWeekId(); },
    
    // Actions
    openEditModal,
    closeEditModal,
    startDrag,
    endDrag,
    setDropTarget,
    openQuickAdd,
    closeQuickAdd,
  };
});
