import { Component } from 'solid-js';
import { ChevronLeft, ChevronRight } from 'lucide-solid';
import { yearStore } from '../stores/yearStore';
import { uiStore } from '../stores/uiStore';

export const YearSelector: Component = () => {
  const handlePrevYear = () => {
    yearStore.setYear(yearStore.year - 1);
    uiStore.navigateBack();
  };

  const handleNextYear = () => {
    yearStore.setYear(yearStore.year + 1);
    uiStore.navigateBack();
  };

  return (
    <div class="flex items-center gap-0.5 sm:gap-1">
      <button
        onClick={handlePrevYear}
        class="btn btn-ghost p-1.5 sm:p-2"
        aria-label="Previous year"
      >
        <ChevronLeft size={18} class="sm:w-5 sm:h-5" />
      </button>

      <span class="min-w-[3rem] sm:min-w-[4.5rem] text-center text-sm sm:text-lg font-semibold tabular-nums">
        {yearStore.year}
      </span>

      <button
        onClick={handleNextYear}
        class="btn btn-ghost p-1.5 sm:p-2"
        aria-label="Next year"
      >
        <ChevronRight size={18} class="sm:w-5 sm:h-5" />
      </button>
    </div>
  );
};
