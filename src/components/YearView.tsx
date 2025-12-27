import { Component, For, Show, createMemo } from 'solid-js';
import { Calendar, Palmtree } from 'lucide-solid';
import { yearStore } from '../stores/yearStore';
import { sprintStore } from '../stores/sprintStore';
import { SprintCard } from './SprintCard';
import { WeekCell } from './WeekCell';
import { MAX_VACATION_WEEKS } from '../types';
import type { Sprint, Week } from '../types';

type Section = 
  | { type: 'sprint'; sprint: Sprint }
  | { type: 'unassigned'; weeks: Week[] }
  | { type: 'vacation'; weeks: Week[] };

export const YearView: Component = () => {
  const groupConsecutiveWeeks = (weeks: Week[]) => {
    const groups: Week[][] = [];
    let currentGroup: Week[] = [];

    weeks.forEach((week, index, arr) => {
      if (currentGroup.length === 0) {
        currentGroup.push(week);
      } else {
        const prevWeek = arr[index - 1];
        // Check if consecutive
        if (week.weekNumber === prevWeek.weekNumber + 1) {
          currentGroup.push(week);
        } else {
          groups.push(currentGroup);
          currentGroup = [week];
        }
      }
    });

    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }

    return groups;
  };

  // Get unassigned weeks (not in any sprint or vacation)
  const unassignedWeeks = createMemo(() => {
    return yearStore.weeks.filter((week) => !week.sprintId && !week.isVacation);
  });

  const vacationWeeks = createMemo(() => {
    return yearStore.weeks.filter((week) => week.isVacation);
  });

  // Get unassigned non-vacation weeks
  const availableWeeks = createMemo(() => {
    return unassignedWeeks();
  });

  // Group consecutive unassigned weeks
  const unassignedGroups = createMemo((): Week[][] => groupConsecutiveWeeks(unassignedWeeks()));
  const vacationGroups = createMemo((): Week[][] => groupConsecutiveWeeks(vacationWeeks()));

  // Interleave sprints and unassigned groups by week number
  const orderedSections = createMemo((): Section[] => {
    const sections: Section[] = [];

    // Add sprints
    const sprints = sprintStore.sortedSprints();
    sprints.forEach((sprint) => {
      sections.push({ type: 'sprint', sprint });
    });

    // Add unassigned groups
    unassignedGroups().forEach((weeks) => {
      if (weeks.length > 0) {
        sections.push({ type: 'unassigned', weeks });
      }
    });

    // Add vacation groups
    vacationGroups().forEach((weeks) => {
      if (weeks.length > 0) {
        sections.push({ type: 'vacation', weeks });
      }
    });

    // Sort by first week number
    return sections.sort((a, b) => {
      const aWeekNum =
        a.type === 'sprint'
          ? yearStore.getWeek(a.sprint.weekIds[0])?.weekNumber ?? 0
          : a.weeks[0].weekNumber;
      const bWeekNum =
        b.type === 'sprint'
          ? yearStore.getWeek(b.sprint.weekIds[0])?.weekNumber ?? 0
          : b.weeks[0].weekNumber;
      return aWeekNum - bWeekNum;
    });
  });

  const sprintCount = createMemo(() => sprintStore.sprints.length);

  return (
    <div class="space-y-6">
      {/* Stats */}
      <div class="flex flex-wrap items-center gap-4 text-sm text-surface-400">
        <div class="flex items-center gap-2">
          <Calendar size={16} />
          <span>{yearStore.weeks.length} weeks</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="h-1.5 w-1.5 rounded-full bg-sprint-azure" />
          <span>{sprintCount()} sprints</span>
        </div>
        <div class="flex items-center gap-2">
          <Palmtree size={16} class="text-vacation" />
          <span>{yearStore.vacationCount()}/{MAX_VACATION_WEEKS} vacation weeks</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="h-1.5 w-1.5 rounded-full bg-surface-500" />
          <span>{availableWeeks().length} available weeks</span>
        </div>
      </div>

      {/* Sections */}
      <div class="space-y-6">
        <For each={orderedSections()}>
          {(section) => (
            <>
              {section.type === 'sprint' ? (
                <SprintCard sprint={section.sprint} />
              ) : section.type === 'vacation' ? (
                <WeekGroupSection
                  weeks={section.weeks}
                  label="Vacation"
                  labelClasses="text-vacation"
                  markerClasses="bg-vacation/40"
                />
              ) : (
                <WeekGroupSection
                  weeks={section.weeks}
                  label="Unassigned"
                  labelClasses="text-surface-500"
                  markerClasses="bg-surface-800"
                />
              )}
            </>
          )}
        </For>
      </div>

      {/* Empty state */}
      <Show when={yearStore.weeks.length > 0 && sprintCount() === 0}>
        <div class="rounded-xl border border-dashed border-surface-700 bg-surface-900/50 p-8 text-center">
          <Calendar size={48} class="mx-auto text-surface-600" />
          <h3 class="mt-4 text-lg font-medium text-surface-300">
            No sprints yet
          </h3>
          <p class="mt-2 text-sm text-surface-500 max-w-md mx-auto">
            Click "Start Sprint" on any week to create a 6-week sprint cycle. 
            You can also mark weeks as vacation to plan your breaks between cycles.
          </p>
        </div>
      </Show>
    </div>
  );
};

// Unassigned weeks section component
interface UnassignedWeeksSectionProps {
  weeks: Week[];
  label: string;
  labelClasses: string;
  markerClasses: string;
}

const WeekGroupSection: Component<UnassignedWeeksSectionProps> = (props) => {
  const formatRange = () => {
    if (props.weeks.length === 0) return '';
    const first = props.weeks[0];
    const last = props.weeks[props.weeks.length - 1];
    if (first.weekNumber === last.weekNumber) {
      return `Week ${first.weekNumber}`;
    }
    return `Weeks ${first.weekNumber}–${last.weekNumber}`;
  };

  return (
    <div class="space-y-3">
      <div class={`flex items-center gap-2 text-sm ${props.labelClasses}`}>
        <span class={`h-px flex-1 ${props.markerClasses}`} />
        <span>{formatRange()} · {props.label}</span>
        <span class={`h-px flex-1 ${props.markerClasses}`} />
      </div>
      
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <For each={props.weeks}>
          {(week) => <WeekCell week={week} />}
        </For>
      </div>
    </div>
  );
};
