import fs from 'node:fs/promises';
import path from 'node:path';
import { DailyRateData, DateParam } from './types';

export * from './types';

const DATA_DIR = path.join(process.cwd(), 'data');

/**
 * Normalizes dataset to ensure currencies/forex and metals are always valid arrays.
 */
function normalizeRateData(rawData: any): DailyRateData {
  const metals = Array.isArray(rawData.metals) ? rawData.metals : [];
  let currencies = Array.isArray(rawData.currencies)
    ? rawData.currencies
    : Array.isArray(rawData.forex)
    ? rawData.forex
    : [];

  // Guarantee minimum default currencies fallback if empty
  if (currencies.length === 0) {
    currencies = [
      { code: "EUR", name: "Euro", symbol: "€", rateToUsd: 1.155, usdToRate: 0.8655 },
      { code: "GBP", name: "British Pound", symbol: "£", rateToUsd: 1.348, usdToRate: 0.7415 },
      { code: "JPY", name: "Japanese Yen", symbol: "¥", rateToUsd: 0.0063, usdToRate: 157.88 },
      { code: "CAD", name: "Canadian Dollar", symbol: "C$", rateToUsd: 0.716, usdToRate: 1.395 },
      { code: "AUD", name: "Australian Dollar", symbol: "A$", rateToUsd: 0.706, usdToRate: 1.416 },
      { code: "CHF", name: "Swiss Franc", symbol: "CHF", rateToUsd: 1.236, usdToRate: 0.808 },
      { code: "INR", name: "Indian Rupee", symbol: "₹", rateToUsd: 0.0119, usdToRate: 83.88 },
      { code: "CNY", name: "Chinese Yuan", symbol: "¥", rateToUsd: 0.138, usdToRate: 7.234 }
    ];
  }

  return {
    date: rawData.date || new Date().toISOString().split('T')[0],
    timestamp: rawData.timestamp || (rawData.updatedAt ? new Date(rawData.updatedAt).getTime() : Date.now()),
    baseCurrency: rawData.baseCurrency || 'USD',
    metals,
    currencies,
    taxes: rawData.taxes || {
      gstPercentage: 3,
      customsDutyPercentage: 6,
      hallmarkFeeInr: 45,
      hallmarkGstPercentage: 18,
      lastUpdated: rawData.date || new Date().toISOString().split('T')[0]
    }
  };
}

/**
 * Safely reads and parses a rate JSON file for a given year, month, day.
 */
export async function getRatesByDate(year: string, month: string, day: string): Promise<DailyRateData | null> {
  const formattedMonth = month.padStart(2, '0');
  const formattedDay = day.padStart(2, '0');
  const filePath = path.join(DATA_DIR, year, formattedMonth, `${formattedDay}.json`);

  try {
    const content = await fs.readFile(filePath, 'utf8');
    const parsed = JSON.parse(content);
    return normalizeRateData(parsed);
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
      if (year.startsWith('.')) continue;
      const yearPath = path.join(DATA_DIR, year);
      const yearStat = await fs.stat(yearPath);
      if (!yearStat.isDirectory()) continue;

      const months = await fs.readdir(yearPath);
      for (const month of months) {
        if (month.startsWith('.')) continue;
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
