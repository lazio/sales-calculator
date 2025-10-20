export interface RateConfig {
  role: string;
  monthlyRate: number;
}

export const DEFAULT_RATES: RateConfig[] = [];

export const STORAGE_KEY = 'quote-calculator-rates';
