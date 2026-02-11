import type { Week, YearData } from '../types';

/**
 * Get the Monday for the week containing the given date.
 */
function getWeekStartForDate(date: Date): Date {
  const result = new Date(date.valueOf());
  const dayOfWeek = (result.getDay() + 6) % 7; // 0 = Monday
  result.setDate(result.getDate() - dayOfWeek);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get the first week start for a year (first Monday on or after Jan 1).
 */
function getFirstWeekStart(year: number): Date {
  const jan1 = new Date(year, 0, 1);
  const dayOfWeek = (jan1.getDay() + 6) % 7; // 0 = Monday
  if (dayOfWeek === 0) return jan1;
  const result = new Date(jan1);
  result.setDate(jan1.getDate() + (7 - dayOfWeek));
  return result;
}

/**
 * Get the last week start for a year (Monday on or before Dec 31).
 */
function getLastWeekStart(year: number): Date {
  const dec31 = new Date(year, 11, 31);
  return getWeekStartForDate(dec31);
}

/**
 * Format date as ISO string (YYYY-MM-DD)
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Generate a single week object
 */
function generateWeek(year: number, weekNumber: number, startDate: Date): Week {
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);

  return {
    id: `${year}-W${String(weekNumber).padStart(2, '0')}`,
    weekNumber,
    year,
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
    isVacation: false,
    isCooldown: false,
    sprintId: null,
    tasks: [],
    order: weekNumber,
  };
}

/**
 * Calculate the number of weeks in a year based on Monday-week starts.
 */
function getWeeksInYear(year: number): number {
  const firstStart = getFirstWeekStart(year);
  const lastStart = getLastWeekStart(year);
  const diffDays = (lastStart.getTime() - firstStart.getTime()) / 86400000;
  return Math.floor(diffDays / 7) + 1;
}

/**
 * YearGenerator creates the 52/53 weeks for a given year.
 */
export const YearGenerator = {
  /**
   * Generate all weeks for a year
   */
  generateYear(year: number): YearData {
    const weeks: Week[] = [];
    const firstStart = getFirstWeekStart(year);
    const lastStart = getLastWeekStart(year);

    let weekNum = 1;
    for (let start = new Date(firstStart); start <= lastStart; ) {
      weeks.push(generateWeek(year, weekNum, start));
      weekNum += 1;
      start = new Date(start);
      start.setDate(start.getDate() + 7);
    }

    return {
      year,
      weeks,
      sprints: [],
      vacationWeekIds: [],
      cooldownWeekIds: [],
    };
  },

  /**
   * Get the number of weeks in a year
   */
  getWeekCount(year: number): number {
    return getWeeksInYear(year);
  },

  /**
   * Get the week number for a date
   */
  getWeekNumber(date: Date): number {
    const weekStart = getWeekStartForDate(date);
    const weekYear = weekStart.getFullYear();
    const firstStart = getFirstWeekStart(weekYear);
    const diffDays = (weekStart.getTime() - firstStart.getTime()) / 86400000;
    return Math.floor(diffDays / 7) + 1;
  },

  /**
   * Get the week ID for a date
   */
  getWeekId(date: Date): string {
    const weekStart = getWeekStartForDate(date);
    const year = weekStart.getFullYear();
    const weekNum = this.getWeekNumber(date);
    return `${year}-W${String(weekNum).padStart(2, '0')}`;
  },

  /**
   * Get the current week ID
   */
  getCurrentWeekId(): string {
    return this.getWeekId(new Date());
  },

  /**
   * Get the current year
   */
  getCurrentYear(): number {
    return new Date().getFullYear();
  },
};
