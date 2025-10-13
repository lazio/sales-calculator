import { RateConfig } from '../types/rates.types';
import { ProjectModule } from '../types/project.types';

export interface QuoteCalculation {
  totalQuote: number;
  monthlyFee: number; // Total monthly fee for all performers
  productPrice: number; // (monthlyFee / 20) * totalDays
  totalDays: number;
  teamSizeMultiplier: number;
  modulesInTimeline: string[]; // IDs of modules that fit in the timeline
  discountAmount: number; // Amount discounted from total
  finalTotal: number; // Total after discount
}

/**
 * Calculate the total quote based on project modules and monthly rates
 * Calculations are based on working days from CSV data
 * Timeline assumes frontend and backend work happens in parallel
 */
export function calculateQuote(
  rates: RateConfig[],
  modules: ProjectModule[] = [],
  customTimeline?: number,
  discountPercentage: number = 0
): QuoteCalculation {
  const enabledModules = modules.filter(m => m.isEnabled);

  // Calculate optimal timeline days (assuming frontend and backend work in parallel)
  // For each module, take the max of frontend and backend, then sum across modules
  const optimalTimeline = enabledModules
    .reduce((sum, m) => sum + Math.max(m.frontendDays, m.backendDays), 0);

  // Use custom timeline if provided, otherwise use optimal
  const actualTimeline = customTimeline || optimalTimeline;

  // Determine which modules fit in the timeline
  // When timeline is compressed, exclude modules from bottom up until we fit
  let modulesInTimeline: string[] = [];
  let modulesToInclude = [...enabledModules];

  if (actualTimeline < optimalTimeline) {
    // Compressed timeline: fit modules until we run out of time
    let remainingTime = actualTimeline;
    modulesToInclude = [];

    // Start from the beginning (top) and add modules until we run out of time
    for (const module of enabledModules) {
      const moduleTime = Math.max(module.frontendDays, module.backendDays);
      if (remainingTime >= moduleTime) {
        modulesToInclude.push(module);
        remainingTime -= moduleTime;
      }
    }
  } else {
    // Normal or extended timeline: all modules fit
    modulesToInclude = enabledModules;
  }

  modulesInTimeline = modulesToInclude.map(m => m.id);

  // Calculate total monthly fee for all performers
  const monthlyFee = rates.reduce((sum, rate) => sum + rate.monthlyRate, 0);

  // Calculate product price: (monthlyFee / 20 business days) * estimate in days
  const productPrice = Math.round((monthlyFee / 20) * actualTimeline);

  // Total quote = monthly fee + product price
  const totalQuote = monthlyFee + productPrice;

  return {
    totalQuote,
    monthlyFee,
    productPrice,
    totalDays: actualTimeline,
    teamSizeMultiplier: 1, // Always 1 now, keeping for backwards compatibility
    modulesInTimeline,
  };
}

/**
 * Calculate quote for a specific number of months
 */
export function calculateQuoteForDuration(
  rates: RateConfig[],
  months: number
): Omit<QuoteCalculation, 'totalDays' | 'teamSizeMultiplier' | 'modulesInTimeline'> {
  const monthlyCalculation = calculateQuote(rates);

  return {
    totalQuote: monthlyCalculation.totalQuote * months,
    monthlyFee: monthlyCalculation.monthlyFee * months,
    productPrice: monthlyCalculation.productPrice * months,
  };
}
