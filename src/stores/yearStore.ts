import { createSignal, createRoot, createMemo } from 'solid-js';
import { createStore, produce } from 'solid-js/store';
import type { Week, YearData, Task, Sprint } from '../types';
import { generateId, MAX_VACATION_WEEKS } from '../types';
import { StorageService } from '../services/StorageService';
import { YearGenerator } from '../services/YearGenerator';

// Wrap all reactive computations in createRoot
export const yearStore = createRoot(() => {
  // Current year signal
  const [currentYear, setCurrentYear] = createSignal(new Date().getFullYear());

  // Year data store
  const [yearData, setYearData] = createStore<YearData>({
    year: currentYear(),
    weeks: [],
    sprints: [],
    vacationWeekIds: [],
  });

  /**
   * Initialize or load year data
   */
  function initializeYear(year: number): void {
    const stored = StorageService.loadYear(year);
    
    if (stored) {
      setYearData(stored);
    } else {
      const generated = YearGenerator.generateYear(year);
      setYearData(generated);
      StorageService.saveYear(generated);
    }
  }

  // Initialize on first load
  initializeYear(currentYear());

  /**
   * Get weeks that are not part of any sprint and not vacation
   */
  const availableWeeks = createMemo(() => {
    return yearData.weeks.filter(
      (week) => week.sprintId === null && !week.isVacation
    );
  });

  /**
   * Get the count of vacation weeks
   */
  const vacationCount = createMemo(() => yearData.vacationWeekIds.length);

  /**
   * Check if more vacations can be added
   */
  const canAddVacation = createMemo(() => vacationCount() < MAX_VACATION_WEEKS);

  /**
   * Get a week by ID
   */
  function getWeek(weekId: string): Week | undefined {
    return yearData.weeks.find((w) => w.id === weekId);
  }

  /**
   * Get weeks by sprint ID
   */
  function getWeeksBySprint(sprintId: string): Week[] {
    return yearData.weeks.filter((w) => w.sprintId === sprintId);
  }

  /**
   * Toggle vacation status for a week
   */
  function toggleVacation(weekId: string): boolean {
    const week = getWeek(weekId);
    if (!week) return false;

    // If already vacation, remove it
    if (week.isVacation) {
      setYearData(
        produce((state) => {
          const weekIndex = state.weeks.findIndex((w) => w.id === weekId);
          if (weekIndex !== -1) {
            state.weeks[weekIndex].isVacation = false;
            state.vacationWeekIds = state.vacationWeekIds.filter((id) => id !== weekId);
          }
        })
      );
      saveCurrentYear();
      return true;
    }

    // Check if can add vacation
    if (!canAddVacation()) return false;

    // Can't make week vacation if it's part of a sprint
    if (week.sprintId !== null) return false;

    setYearData(
      produce((state) => {
        const weekIndex = state.weeks.findIndex((w) => w.id === weekId);
        if (weekIndex !== -1) {
          state.weeks[weekIndex].isVacation = true;
          state.vacationWeekIds.push(weekId);
        }
      })
    );
    saveCurrentYear();
    return true;
  }

  /**
   * Add a task to a week
   */
  function addTask(weekId: string, title: string): Task | null {
    const task: Task = {
      id: generateId(),
      title,
      completed: false,
      weekId,
    };

    setYearData(
      produce((state) => {
        const weekIndex = state.weeks.findIndex((w) => w.id === weekId);
        if (weekIndex !== -1) {
          state.weeks[weekIndex].tasks.push(task);
        }
      })
    );
    saveCurrentYear();

    return task;
  }

  /**
   * Update a task
   */
  function updateTask(weekId: string, taskId: string, updates: Partial<Task>): void {
    setYearData(
      produce((state) => {
        const weekIndex = state.weeks.findIndex((w) => w.id === weekId);
        if (weekIndex !== -1) {
          const taskIndex = state.weeks[weekIndex].tasks.findIndex(
            (t) => t.id === taskId
          );
          if (taskIndex !== -1) {
            Object.assign(state.weeks[weekIndex].tasks[taskIndex], updates);
          }
        }
      })
    );
    saveCurrentYear();
  }

  /**
   * Delete a task
   */
  function deleteTask(weekId: string, taskId: string): void {
    setYearData(
      produce((state) => {
        const weekIndex = state.weeks.findIndex((w) => w.id === weekId);
        if (weekIndex !== -1) {
          state.weeks[weekIndex].tasks = state.weeks[weekIndex].tasks.filter(
            (t) => t.id !== taskId
          );
        }
      })
    );
    saveCurrentYear();
  }

  /**
   * Move a task between weeks
   */
  function moveTask(taskId: string, fromWeekId: string, toWeekId: string): void {
    setYearData(
      produce((state) => {
        const fromIndex = state.weeks.findIndex((w) => w.id === fromWeekId);
        const toIndex = state.weeks.findIndex((w) => w.id === toWeekId);

        if (fromIndex === -1 || toIndex === -1) return;

        const taskIndex = state.weeks[fromIndex].tasks.findIndex(
          (t) => t.id === taskId
        );

        if (taskIndex === -1) return;

        // Remove from source
        const [task] = state.weeks[fromIndex].tasks.splice(taskIndex, 1);
        
        // Update task's weekId and add to target
        task.weekId = toWeekId;
        state.weeks[toIndex].tasks.push(task);
      })
    );
    saveCurrentYear();
  }

  /**
   * Reorder weeks
   */
  function reorderWeeks(fromOrder: number, toOrder: number): void {
    setYearData(
      produce((state) => {
        // Update order values
        state.weeks.forEach((week) => {
          if (week.order === fromOrder) {
            week.order = toOrder;
          } else if (fromOrder < toOrder) {
            // Moving down: shift others up
            if (week.order > fromOrder && week.order <= toOrder) {
              week.order--;
            }
          } else {
            // Moving up: shift others down
            if (week.order >= toOrder && week.order < fromOrder) {
              week.order++;
            }
          }
        });
        
        // Sort by order
        state.weeks.sort((a, b) => a.order - b.order);
      })
    );
    saveCurrentYear();
  }

  /**
   * Update week's sprint assignment
   */
  function assignWeekToSprint(weekId: string, sprintId: string | null): void {
    setYearData(
      produce((state) => {
        const weekIndex = state.weeks.findIndex((w) => w.id === weekId);
        if (weekIndex !== -1) {
          state.weeks[weekIndex].sprintId = sprintId;
        }
      })
    );
  }

  /**
   * Add a sprint to the year data
   */
  function addSprint(sprint: Sprint): void {
    setYearData(
      produce((state) => {
        state.sprints.push(sprint);
      })
    );
    saveCurrentYear();
  }

  /**
   * Update a sprint in the year data
   */
  function updateSprintData(sprintId: string, updates: Partial<Sprint>): void {
    setYearData(
      produce((state) => {
        const index = state.sprints.findIndex((s) => s.id === sprintId);
        if (index !== -1) {
          Object.assign(state.sprints[index], updates);
        }
      })
    );
    saveCurrentYear();
  }

  /**
   * Remove a sprint from the year data
   */
  function removeSprint(sprintId: string): void {
    setYearData(
      produce((state) => {
        const index = state.sprints.findIndex((s) => s.id === sprintId);
        if (index !== -1) {
          state.sprints.splice(index, 1);
        }
      })
    );
    saveCurrentYear();
  }

  /**
   * Save current year data to storage
   */
  function saveCurrentYear(): void {
    const data = JSON.parse(JSON.stringify(yearData)) as YearData;
    StorageService.saveYear(data);
  }

  /**
   * Change the current year
   */
  function setYear(year: number): void {
    if (year !== currentYear()) {
      setCurrentYear(year);
      initializeYear(year);
    }
  }

  return {
    // Getters (reactive)
    get data() { return yearData; },
    get year() { return currentYear(); },
    get weeks() { return yearData.weeks; },
    get vacationWeekIds() { return yearData.vacationWeekIds; },
    availableWeeks,
    vacationCount,
    canAddVacation,
    
    // Actions
    setYear,
    getWeek,
    getWeeksBySprint,
    toggleVacation,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    reorderWeeks,
    assignWeekToSprint,
    addSprint,
    updateSprintData,
    removeSprint,
  };
});
