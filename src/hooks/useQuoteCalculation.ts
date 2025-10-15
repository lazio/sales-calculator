import { useMemo } from 'react';
import { RateConfig } from '@/types/rates.types';
import { ProjectModule } from '@/types/project.types';
import {
  calculateQuote,
  QuoteCalculation,
  TIMELINE_MIN_PERCENTAGE,
  TIMELINE_MAX_PERCENTAGE,
} from '@/services/calculationEngine';

export interface TimelineConstraints {
  min: number;
  optimal: number;
  max: number;
  current: number;
}

export interface QuoteCalculationResult {
  quote: QuoteCalculation;
  optimalQuote: QuoteCalculation;
  timelineConstraints: TimelineConstraints;
}

/**
 * Custom hook for quote calculations with timeline constraints
 * Encapsulates all quote calculation logic and derived state
 */
export function useQuoteCalculation(
  rates: RateConfig[],
  modules: ProjectModule[],
  customTimeline: number | null,
  discount: number
): QuoteCalculationResult {
  // Calculate optimal timeline (without custom timeline adjustment or discount)
  const optimalQuote = useMemo(
    () => calculateQuote(rates, modules),
    [rates, modules]
  );

  // Calculate timeline constraints
  const timelineConstraints = useMemo(() => {
    const optimalTimeline = optimalQuote.totalDays;
    const minTimeline = Math.max(1, Math.ceil(optimalTimeline * TIMELINE_MIN_PERCENTAGE));
    const maxTimeline = Math.ceil(optimalTimeline * TIMELINE_MAX_PERCENTAGE);

    // If customTimeline exists but is now outside the new range, clamp it
    let effectiveCustomTimeline = customTimeline;
    if (customTimeline !== null) {
      if (customTimeline < minTimeline) {
        effectiveCustomTimeline = minTimeline;
      } else if (customTimeline > maxTimeline) {
        effectiveCustomTimeline = maxTimeline;
      }
    }

    return {
      min: minTimeline,
      optimal: optimalTimeline,
      max: maxTimeline,
      current: effectiveCustomTimeline || optimalTimeline,
    };
  }, [optimalQuote.totalDays, customTimeline]);

  // Calculate final quote with custom timeline and discount
  const quote = useMemo(
    () => calculateQuote(rates, modules, customTimeline || undefined, discount),
    [rates, modules, customTimeline, discount]
  );

  return {
    quote,
    optimalQuote,
    timelineConstraints,
  };
}
