export interface MetalRate {
  id: string;
  name: string;
  symbol: string;
  carat?: string;
  purity?: string;
  priceUsdOunce: number;
  priceUsdGram: number;
  priceUsdTon?: number;
  priceInrGram?: number;
  priceInr10Gram?: number;
  priceInrKg?: number;
  unit: string;
  category: string;
}

export interface CurrencyRate {
  code: string;
  name: string;
  symbol: string;
  rateToUsd: number;
  usdToRate: number;
}

export interface DailyRateData {
  date: string;
  timestamp: number;
  baseCurrency: string;
  metals: MetalRate[];
  currencies: CurrencyRate[];
}

export interface DateParam {
  year: string;
  month: string;
  day: string;
}

export interface RateTrend {
  change: number;
  percentage: number;
  isUp: boolean;
  isFlat: boolean;
}

/**
 * Pure calculation helper: Safe to call in both Client & Server components.
 */
export function calculateTrend(currentValue: number, previousValue?: number): RateTrend {
  if (previousValue === undefined || previousValue === 0) {
    return { change: 0, percentage: 0, isUp: true, isFlat: true };
  }

  const change = Number((currentValue - previousValue).toFixed(4));
  const percentage = Number(((change / previousValue) * 100).toFixed(2));
  const isFlat = Math.abs(change) < 0.0001;
  const isUp = change >= 0;

  return { change, percentage, isUp, isFlat };
}
