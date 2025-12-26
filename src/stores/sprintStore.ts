import { createRoot, createMemo } from 'solid-js';
import type { Sprint, SprintColor } from '../types';
import { generateId, SPRINT_COLORS, WEEKS_PER_SPRINT } from '../types';
import { yearStore } from './yearStore';

export const sprintStore = createRoot(() => {
  // Get sprints from year data
  const getSprints = createMemo(() => yearStore.data.sprints);

  /**
   * Get a sprint by ID
   */
  function getSprint(sprintId: string): Sprint | undefined {
    return yearStore.data.sprints.find((s) => s.id === sprintId);
  }

  /**
   * Get the next available color for a sprint
   */
  function getNextColor(): SprintColor {
    const usedColors = yearStore.data.sprints.map((s) => s.colorTheme);
    const available = SPRINT_COLORS.filter((c) => !usedColors.includes(c));
    return available[0] || SPRINT_COLORS[yearStore.data.sprints.length % SPRINT_COLORS.length];
  }

  /**
   * Create a new sprint starting from a week
   */
  function createSprint(startWeekId: string, title?: string): Sprint | null {
    // Find the starting week
    const startWeekIndex = yearStore.weeks.findIndex((w) => w.id === startWeekId);
    if (startWeekIndex === -1) return null;

    // Get 6 consecutive available weeks starting from this one
    const weekIds: string[] = [];
    let currentIndex = startWeekIndex;

    while (weekIds.length < WEEKS_PER_SPRINT && currentIndex < yearStore.weeks.length) {
      const week = yearStore.weeks[currentIndex];
      
      // Skip vacation weeks and already assigned weeks
      if (!week.isVacation && week.sprintId === null) {
        weekIds.push(week.id);
      } else if (week.isVacation) {
        // Vacation found, can't continue
        break;
      } else if (week.sprintId !== null) {
        // Already in a sprint, skip
        currentIndex++;
        continue;
      }
      currentIndex++;
    }

    // Need exactly 6 weeks
    if (weekIds.length !== WEEKS_PER_SPRINT) return null;

    const sprint: Sprint = {
      id: generateId(),
      title: title || `Sprint ${yearStore.data.sprints.length + 1}`,
      goalPitch: '',
      colorTheme: getNextColor(),
      weekIds,
      year: yearStore.year,
      order: yearStore.data.sprints.length,
    };

    // Add sprint to store first
    yearStore.addSprint(sprint);

    // Then assign weeks to the sprint
    weekIds.forEach((weekId) => {
      yearStore.assignWeekToSprint(weekId, sprint.id);
    });

    return sprint;
  }

  /**
   * Update a sprint
   */
  function updateSprint(sprintId: string, updates: Partial<Omit<Sprint, 'id' | 'weekIds' | 'year'>>): void {
    yearStore.updateSprintData(sprintId, updates);
  }

  /**
   * Delete a sprint
   */
  function deleteSprint(sprintId: string): void {
    const sprint = getSprint(sprintId);
    if (!sprint) return;

    // Unassign all weeks
    sprint.weekIds.forEach((weekId) => {
      yearStore.assignWeekToSprint(weekId, null);
    });

    // Remove sprint from store
    yearStore.removeSprint(sprintId);
  }

  /**
   * Get sprints sorted by their first week's order
   */
  const sortedSprints = createMemo(() => {
    return [...yearStore.data.sprints].sort((a, b) => {
      const aFirstWeek = yearStore.weeks.find((w) => w.id === a.weekIds[0]);
      const bFirstWeek = yearStore.weeks.find((w) => w.id === b.weekIds[0]);
      return (aFirstWeek?.order ?? 0) - (bFirstWeek?.order ?? 0);
    });
  });

  return {
    // Getters (reactive)
    get sprints() { return getSprints(); },
    sortedSprints,
    
    // Actions
    getSprint,
    getNextColor,
    createSprint,
    updateSprint,
    deleteSprint,
  };
});
