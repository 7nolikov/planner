import { Component } from 'solid-js';
import { Palmtree } from 'lucide-solid';

export const VacationBadge: Component = () => {
  return (
    <div class="flex items-center gap-1.5 rounded-full bg-vacation/20 px-2 py-1 text-xs font-medium text-vacation">
      <Palmtree size={12} />
      <span>Vacation</span>
    </div>
  );
};

