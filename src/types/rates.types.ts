export interface RateConfig {
  role: string;
  monthlyRate: number;
  discount?: number; // Percentage discount (0-100) applied to this performer's rate
}

export const DEFAULT_RATES: RateConfig[] = [];

export const STORAGE_KEY = 'quote-calculator-rates';
