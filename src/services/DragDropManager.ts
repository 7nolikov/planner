import type { DragState } from '../types';

export type DragType = 'task' | 'week';

export interface DragData {
  type: DragType;
  id: string;
  sourceWeekId?: string;
}

/**
 * DragDropManager handles drag-and-drop operations for tasks and weeks.
 * Uses native HTML5 drag events for performance.
 */
export const DragDropManager = {
  /**
   * Create drag data to attach to the drag event
   */
  createDragData(type: DragType, id: string, sourceWeekId?: string): string {
    const data: DragData = { type, id, sourceWeekId };
    return JSON.stringify(data);
  },

  /**
   * Parse drag data from the drag event
   */
  parseDragData(dataTransfer: DataTransfer): DragData | null {
    try {
      const text = dataTransfer.getData('application/json');
      if (!text) return null;
      return JSON.parse(text) as DragData;
    } catch {
      return null;
    }
  },

  /**
   * Set up drag start event
   */
  handleDragStart(
    event: DragEvent,
    type: DragType,
    id: string,
    sourceWeekId?: string
  ): DragState {
    if (!event.dataTransfer) {
      return { isDragging: false, dragType: null, dragId: null, sourceWeekId: null };
    }

    const data = this.createDragData(type, id, sourceWeekId);
    event.dataTransfer.setData('application/json', data);
    event.dataTransfer.effectAllowed = 'move';

    return {
      isDragging: true,
      dragType: type,
      dragId: id,
      sourceWeekId: sourceWeekId ?? null,
    };
  },

  /**
   * Handle drag over event (enables drop)
   */
  handleDragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  },

  /**
   * Handle drag end event
   */
  handleDragEnd(): DragState {
    return {
      isDragging: false,
      dragType: null,
      dragId: null,
      sourceWeekId: null,
    };
  },

  /**
   * Check if drop is valid
   */
  isValidDrop(
    dragData: DragData,
    targetType: 'week' | 'task-slot',
    targetId: string
  ): boolean {
    // Tasks can be dropped into weeks
    if (dragData.type === 'task' && targetType === 'week') {
      // Can't drop on the same week if no reordering
      return dragData.sourceWeekId !== targetId;
    }

    // Weeks can be reordered
    if (dragData.type === 'week' && targetType === 'week') {
      return dragData.id !== targetId;
    }

    return false;
  },
};

