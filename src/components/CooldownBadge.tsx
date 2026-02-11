import { Component } from 'solid-js';
import { Coffee } from 'lucide-solid';

export const CooldownBadge: Component = () => {
  return (
    <div class="flex items-center gap-1.5 rounded-full bg-cooldown/20 px-2 py-1 text-xs font-medium text-cooldown">
      <Coffee size={12} />
      <span>Cooldown</span>
    </div>
  );
};
