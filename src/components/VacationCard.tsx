import { Component, For } from 'solid-js';
import { Palmtree } from 'lucide-solid';
import type { Week } from '../types';
import { WeekCell } from './WeekCell';

interface VacationCardProps {
  weeks: Week[];
}

export const VacationCard: Component<VacationCardProps> = (props) => {
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
    <div class="vacation-card overflow-hidden">
      <div class="vacation-card__header px-4 py-3 border-b border-surface-800">
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <Palmtree size={16} class="text-vacation" />
              <h3 class="font-semibold text-white truncate">Vacation</h3>
              <span class="rounded-full bg-vacation/20 px-2 py-0.5 text-xs font-medium text-vacation">
                Break
              </span>
            </div>
            <p class="mt-1 text-xs text-surface-400">{formatRange()}</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px bg-surface-800">
        <For each={props.weeks}>
          {(week) => (
            <div class="bg-surface-900">
              <WeekCell week={week} />
            </div>
          )}
        </For>
      </div>
    </div>
  );
};
