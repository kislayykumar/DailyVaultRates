import fs from 'node:fs/promises';
import path from 'node:path';
import { DailyRateData, DateParam } from './types';

export * from './types';

const DATA_DIR = path.join(process.cwd(), 'data');

/**
 * Safely reads and parses a rate JSON file for a given year, month, day.
 */
export async function getRatesByDate(year: string, month: string, day: string): Promise<DailyRateData | null> {
  const formattedMonth = month.padStart(2, '0');
  const formattedDay = day.padStart(2, '0');
  const filePath = path.join(DATA_DIR, year, formattedMonth, `${formattedDay}.json`);

  try {
    const content = await fs.readFile(filePath, 'utf8');
    return JSON.parse(content) as DailyRateData;
  } catch (error) {
    return null;
  }
}

/**
 * Traverses the data directory recursively to discover all available date JSON files.
 */
export async function getAllAvailableDates(): Promise<DateParam[]> {
  const dates: DateParam[] = [];

  try {
    const years = await fs.readdir(DATA_DIR);
    for (const year of years) {
      const yearPath = path.join(DATA_DIR, year);
      const yearStat = await fs.stat(yearPath);
      if (!yearStat.isDirectory()) continue;

      const months = await fs.readdir(yearPath);
      for (const month of months) {
        const monthPath = path.join(yearPath, month);
        const monthStat = await fs.stat(monthPath);
        if (!monthStat.isDirectory()) continue;

        const files = await fs.readdir(monthPath);
        for (const file of files) {
          if (file.endsWith('.json')) {
            const day = file.replace('.json', '');
            dates.push({ year, month, day });
          }
        }
      }
    }
  } catch (error) {
    console.error('Error reading dates from data directory:', error);
  }

  // Sort descending by date
  return dates.sort((a, b) => {
    const dateA = `${a.year}-${a.month.padStart(2, '0')}-${a.day.padStart(2, '0')}`;
    const dateB = `${b.year}-${b.month.padStart(2, '0')}-${b.day.padStart(2, '0')}`;
    return dateB.localeCompare(dateA);
  });
}

/**
 * Retrieves the latest available date rate dataset.
 */
export async function getLatestRates(): Promise<{ data: DailyRateData; param: DateParam } | null> {
  const allDates = await getAllAvailableDates();
  if (allDates.length === 0) return null;

  const latest = allDates[0];
  const data = await getRatesByDate(latest.year, latest.month, latest.day);
  if (!data) return null;

  return { data, param: latest };
}

/**
 * Finds the immediate prior dataset relative to a target YYYY-MM-DD date.
 */
export async function getPreviousDayRates(currentDateStr: string): Promise<DailyRateData | null> {
  const allDates = await getAllAvailableDates();
  const sortedDatesStr = allDates.map(d => `${d.year}-${d.month.padStart(2, '0')}-${d.day.padStart(2, '0')}`);
  
  const currentIndex = sortedDatesStr.indexOf(currentDateStr);
  if (currentIndex === -1 || currentIndex >= allDates.length - 1) {
    const targetDate = new Date(currentDateStr);
    targetDate.setDate(targetDate.getDate() - 1);
    const prevYear = String(targetDate.getUTCFullYear());
    const prevMonth = String(targetDate.getUTCMonth() + 1).padStart(2, '0');
    const prevDay = String(targetDate.getUTCDate()).padStart(2, '0');
    return getRatesByDate(prevYear, prevMonth, prevDay);
  }

  const prevParam = allDates[currentIndex + 1];
  return getRatesByDate(prevParam.year, prevParam.month, prevParam.day);
}

/**
 * Retrieves all available historical daily rate datasets, sorted chronologically ascending (oldest to newest).
 */
export async function getHistoricalDataHistory(): Promise<DailyRateData[]> {
  const allDates = await getAllAvailableDates();
  // Sort ascending by date for chronological charts
  const chronologicalDates = [...allDates].reverse();

  const results: DailyRateData[] = [];
  for (const d of chronologicalDates) {
    const data = await getRatesByDate(d.year, d.month, d.day);
    if (data) {
      results.push(data);
    }
  }
  return results;
}

