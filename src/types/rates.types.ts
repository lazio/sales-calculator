export interface RateConfig {
  role: string;
  monthlyRate: number;
  discount?: number; // Percentage discount (0-100) applied to this performer's rate
}

export const DEFAULT_RATES: RateConfig[] = [];

export const STORAGE_KEY = 'quote-calculator-rates';

/**
 * Type guard to validate if a value is a valid RateConfig
 */
export function isRateConfig(value: unknown): value is RateConfig {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const obj = value as Record<string, unknown>;

  return (
    typeof obj.role === 'string' &&
    typeof obj.monthlyRate === 'number' &&
    obj.monthlyRate >= 0 &&
    (obj.discount === undefined || (typeof obj.discount === 'number' && obj.discount >= 0 && obj.discount <= 100))
  );
}

/**
 * Type guard to validate if a value is an array of RateConfig
 */
export function isRateConfigArray(value: unknown): value is RateConfig[] {
  return Array.isArray(value) && value.every(isRateConfig);
}
