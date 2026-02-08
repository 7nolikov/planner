import { Component, createSignal, Show } from 'solid-js';
import { Check, GripVertical, Trash2 } from 'lucide-solid';
import type { Task } from '../types';
import { yearStore } from '../stores/yearStore';
import { uiStore } from '../stores/uiStore';
import { DragDropManager } from '../services/DragDropManager';

interface TaskItemProps {
  task: Task;
  weekId: string;
}

export const TaskItem: Component<TaskItemProps> = (props) => {
  const [isEditing, setIsEditing] = createSignal(false);
  const [editValue, setEditValue] = createSignal('');

  const handleDragStart = (e: DragEvent) => {
    DragDropManager.handleDragStart(e, 'task', props.task.id, props.weekId);
    uiStore.startDrag('task', props.task.id, props.weekId);
    
    // Add dragging class
    (e.target as HTMLElement).classList.add('dragging');
  };

  const handleDragEnd = (e: DragEvent) => {
    uiStore.endDrag();
    (e.target as HTMLElement).classList.remove('dragging');
  };

  const handleToggleComplete = () => {
    yearStore.updateTask(props.weekId, props.task.id, {
      completed: !props.task.completed,
    });
  };

  const handleDelete = () => {
    yearStore.deleteTask(props.weekId, props.task.id);
    uiStore.showToast(`Deleted "${props.task.title}"`, {
      durationMs: 5000,
      action: { label: 'Undo', fn: () => yearStore.undo() },
    });
  };

  const startEdit = () => {
    setEditValue(props.task.title);
    setIsEditing(true);
  };

  const saveEdit = () => {
    const value = editValue().trim();
    if (value && value !== props.task.title) {
      yearStore.updateTask(props.weekId, props.task.id, { title: value });
    }
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setIsEditing(false);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  return (
    <div
      class="task-item group flex items-center gap-2"
      draggable={!isEditing()}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <button
        class="flex-shrink-0 text-surface-500 hover:text-surface-300 cursor-grab"
        aria-label="Drag to reorder"
      >
        <GripVertical size={14} />
      </button>

      <button
        onClick={handleToggleComplete}
        class={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border transition-colors ${
          props.task.completed
            ? 'border-emerald-500 bg-emerald-500 text-white'
            : 'border-surface-600 hover:border-surface-500'
        }`}
        aria-label={props.task.completed ? 'Mark incomplete' : 'Mark complete'}
      >
        <Show when={props.task.completed}>
          <Check size={10} />
        </Show>
      </button>

      <Show
        when={!isEditing()}
        fallback={
          <input
            type="text"
            value={editValue()}
            onInput={(e) => setEditValue(e.currentTarget.value)}
            onBlur={saveEdit}
            onKeyDown={handleKeyDown}
            class="flex-1 bg-transparent px-1 text-sm outline-none"
            autofocus
          />
        }
      >
        <span
          onClick={startEdit}
          class={`flex-1 cursor-text truncate text-sm ${
            props.task.completed ? 'text-surface-500 line-through' : 'text-surface-200'
          }`}
        >
          {props.task.title}
        </span>
      </Show>

      <button
        onClick={handleDelete}
        class="flex-shrink-0 text-surface-600 opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
        aria-label="Delete task"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
};

