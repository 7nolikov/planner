import type { YearData } from '../types';

const STORAGE_KEY_PREFIX = 'shapeup-planner';

/**
 * StorageService provides a clean abstraction over localStorage.
 * Handles serialization, error recovery, and data versioning.
 */
export const StorageService = {
  /**
   * Get the storage key for a specific year
   */
  getKey(year: number): string {
    return `${STORAGE_KEY_PREFIX}-${year}`;
  },

  /**
   * Save year data to localStorage
   */
  saveYear(data: YearData): boolean {
    try {
      const key = this.getKey(data.year);
      const serialized = JSON.stringify(data);
      localStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      console.error('Failed to save year data:', error);
      return false;
    }
  },

  /**
   * Load year data from localStorage
   */
  loadYear(year: number): YearData | null {
    try {
      const key = this.getKey(year);
      const serialized = localStorage.getItem(key);
      if (!serialized) return null;
      return JSON.parse(serialized) as YearData;
    } catch (error) {
      console.error('Failed to load year data:', error);
      return null;
    }
  },

  /**
   * Check if year data exists
   */
  hasYear(year: number): boolean {
    const key = this.getKey(year);
    return localStorage.getItem(key) !== null;
  },

  /**
   * Delete year data
   */
  deleteYear(year: number): boolean {
    try {
      const key = this.getKey(year);
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Failed to delete year data:', error);
      return false;
    }
  },

  /**
   * Get all stored years
   */
  getStoredYears(): number[] {
    const years: number[] = [];
    const prefix = `${STORAGE_KEY_PREFIX}-`;
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(prefix)) {
        const yearStr = key.slice(prefix.length);
        const year = parseInt(yearStr, 10);
        if (!isNaN(year)) {
          years.push(year);
        }
      }
    }
    
    return years.sort((a, b) => a - b);
  },

  /**
   * Export all data as JSON
   */
  exportAll(): Record<number, YearData> {
    const result: Record<number, YearData> = {};
    const years = this.getStoredYears();
    
    for (const year of years) {
      const data = this.loadYear(year);
      if (data) {
        result[year] = data;
      }
    }
    
    return result;
  },

  /**
   * Import data from JSON
   */
  importAll(data: Record<number, YearData>): boolean {
    try {
      for (const [year, yearData] of Object.entries(data)) {
        this.saveYear({ ...yearData, year: parseInt(year, 10) });
      }
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  },

  /**
   * Clear all planner data
   */
  clearAll(): boolean {
    try {
      const years = this.getStoredYears();
      for (const year of years) {
        this.deleteYear(year);
      }
      return true;
    } catch (error) {
      console.error('Failed to clear all data:', error);
      return false;
    }
  },
};

