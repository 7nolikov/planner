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
    <div class="flex items-center gap-2">
      <button
        onClick={handlePrevYear}
        class="btn btn-ghost p-2"
        aria-label="Previous year"
      >
        <ChevronLeft size={20} />
      </button>
      
      <span class="min-w-[80px] text-center text-lg font-semibold tabular-nums">
        {yearStore.year}
      </span>
      
      <button
        onClick={handleNextYear}
        class="btn btn-ghost p-2"
        aria-label="Next year"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

