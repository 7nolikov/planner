import { Component, For } from 'solid-js';
import { Coffee } from 'lucide-solid';
import type { Week } from '../types';
import { WeekCell } from './WeekCell';

interface CooldownCardProps {
  weeks: Week[];
}

export const CooldownCard: Component<CooldownCardProps> = (props) => {
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
    <div class="cooldown-card overflow-hidden">
      <div class="cooldown-card__header px-4 py-3 border-b border-surface-800">
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <Coffee size={16} class="text-cooldown" />
              <h3 class="font-semibold text-white truncate">Cooldown</h3>
              <span class="rounded-full bg-cooldown/20 px-2 py-0.5 text-xs font-medium text-cooldown">
                2 weeks
              </span>
            </div>
            <p class="mt-1 text-xs text-surface-400">{formatRange()} · Bug fixes, small improvements & exploration</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-px bg-surface-800">
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
