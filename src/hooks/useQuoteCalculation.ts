import { useMemo } from 'react';
import { RateConfig } from '@/types/rates.types';
import { ProjectModule } from '@/types/project.types';
import {
  calculateQuote,
  QuoteCalculation,
} from '@/services/calculationEngine';

/**
 * Custom hook for quote calculations
 * Encapsulates all quote calculation logic
 */
export function useQuoteCalculation(
  rates: RateConfig[],
  modules: ProjectModule[],
  discount: number,
  overlapDays: number = Infinity
): QuoteCalculation {
  // Calculate quote with discount and overlap
  const quote = useMemo(
    () => calculateQuote(rates, modules, discount, overlapDays),
    [rates, modules, discount, overlapDays]
  );

  return quote;
}
