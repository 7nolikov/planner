import type { Week, YearData } from '../types';

/**
 * Calculate the ISO week number for a given date.
 * ISO weeks start on Monday and the first week contains January 4th.
 */
function getISOWeekNumber(date: Date): number {
  const target = new Date(date.valueOf());
  // Set to nearest Thursday: current date + 4 - current day number
  const dayNum = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNum + 3);
  // Compare with first Thursday of the year
  const firstThursday = new Date(target.getFullYear(), 0, 4);
  const dayOfYear = (target.getTime() - firstThursday.getTime()) / 86400000;
  return 1 + Math.ceil(dayOfYear / 7);
}

/**
 * Get the Monday of a given ISO week.
 */
function getWeekStart(year: number, weekNumber: number): Date {
  // Find January 4th (always in week 1)
  const jan4 = new Date(year, 0, 4);
  // Find the Monday of week 1
  const dayOfWeek = (jan4.getDay() + 6) % 7; // 0 = Monday
  const week1Monday = new Date(jan4);
  week1Monday.setDate(jan4.getDate() - dayOfWeek);
  // Add weeks
  const result = new Date(week1Monday);
  result.setDate(week1Monday.getDate() + (weekNumber - 1) * 7);
  return result;
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
function generateWeek(year: number, weekNumber: number): Week {
  const startDate = getWeekStart(year, weekNumber);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);

  return {
    id: `${year}-W${String(weekNumber).padStart(2, '0')}`,
    weekNumber,
    year,
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
    isVacation: false,
    sprintId: null,
    tasks: [],
    order: weekNumber,
  };
}

/**
 * Calculate the number of ISO weeks in a year.
 * Most years have 52 weeks, but some have 53.
 */
function getWeeksInYear(year: number): number {
  // A year has 53 weeks if Jan 1 is Thursday or if it's a leap year and Jan 1 is Wednesday
  const jan1 = new Date(year, 0, 1);
  const jan1Day = jan1.getDay();
  
  // Check if leap year
  const isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  
  if (jan1Day === 4 || (isLeap && jan1Day === 3)) {
    return 53;
  }
  
  // Also check Dec 31
  const dec31 = new Date(year, 11, 31);
  const dec31Day = dec31.getDay();
  
  if (dec31Day === 4 || (isLeap && dec31Day === 5)) {
    return 53;
  }
  
  return 52;
}

/**
 * YearGenerator creates the 52/53 weeks for a given year.
 */
export const YearGenerator = {
  /**
   * Generate all weeks for a year
   */
  generateYear(year: number): YearData {
    const weekCount = getWeeksInYear(year);
    const weeks: Week[] = [];

    for (let weekNum = 1; weekNum <= weekCount; weekNum++) {
      weeks.push(generateWeek(year, weekNum));
    }

    return {
      year,
      weeks,
      sprints: [],
      vacationWeekIds: [],
    };
  },

  /**
   * Get the number of weeks in a year
   */
  getWeekCount(year: number): number {
    return getWeeksInYear(year);
  },

  /**
   * Get the ISO week number for a date
   */
  getWeekNumber(date: Date): number {
    return getISOWeekNumber(date);
  },

  /**
   * Get the week ID for a date
   */
  getWeekId(date: Date): string {
    const year = date.getFullYear();
    const weekNum = getISOWeekNumber(date);
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

