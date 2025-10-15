import { RateConfig } from '@/types/rates.types';
import { ProjectModule } from '@/types/project.types';

// Constants
export const BUSINESS_DAYS_PER_MONTH = 20;
export const TIMELINE_MIN_PERCENTAGE = 0.5; // 50% of optimal
export const TIMELINE_MAX_PERCENTAGE = 2; // 200% of optimal

export interface QuoteCalculation {
  // Cost breakdown
  totalQuote: number; // Total quote (before discount)

  // Legacy/Reference fields
  monthlyFee: number; // Total monthly fee for all performers (rate card)
  productPrice: number; // Same as totalQuote (backward compatibility)
  totalDays: number; // Total timeline days

  // Discount
  discountAmount: number; // Amount discounted from total
  finalTotal: number; // Total after discount

  // Module tracking
  teamSizeMultiplier: number; // Always 1 (backward compatibility)
  modulesInTimeline: string[]; // IDs of modules that fit in the timeline
}

export interface ModuleStats {
  timelineDays: number; // Total timeline (parallel work)
  effortDays: number; // Total effort (sum of all work)
}

export interface ModulePriceCalculation {
  moduleId: string;
  price: number;
  timelineDays: number;
}

/**
 * Calculate the total quote based on project modules and monthly rates
 * Calculations are based on working days from CSV data
 * Timeline assumes:
 * - Frontend and backend work happens in parallel
 * - Module timeline = MAX(Frontend, Backend)
 */
export function calculateQuote(
  rates: RateConfig[],
  modules: ProjectModule[] = [],
  customTimeline?: number,
  discountPercentage: number = 0
): QuoteCalculation {
  const enabledModules = modules.filter(m => m.isEnabled);

  // Calculate optimal timeline days
  // Timeline = sum of MAX(Frontend, Backend) per module
  const optimalTimeline = enabledModules
    .reduce((sum, m) => sum + Math.max(m.frontendDays, m.backendDays), 0);

  // Use custom timeline if provided, otherwise use optimal
  const actualTimeline = customTimeline || optimalTimeline;

  // Determine which modules fit in the timeline
  // When timeline is compressed, exclude modules from bottom up until we fit
  let modulesInTimeline: string[] = [];
  let modulesToInclude = [...enabledModules];

  if (customTimeline && customTimeline < optimalTimeline) {
    // Compressed timeline: fit modules until we run out of time
    let remainingTime = customTimeline;
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

  // Calculate daily rate
  const dailyRate = monthlyFee / BUSINESS_DAYS_PER_MONTH;

  // Total quote = daily rate * actual timeline
  const totalQuote = Math.round(dailyRate * actualTimeline);

  // Product price represents the actual cost (same as totalQuote for consistency)
  const productPrice = totalQuote;

  // Apply discount
  const discountAmount = Math.round((totalQuote * discountPercentage) / 100);
  const finalTotal = totalQuote - discountAmount;

  return {
    // Cost breakdown
    totalQuote,

    // Legacy/Reference fields
    monthlyFee, // Keep for reference (rate card)
    productPrice, // Actual project cost (backward compatibility)
    totalDays: actualTimeline,

    // Discount
    discountAmount,
    finalTotal,

    // Module tracking
    teamSizeMultiplier: 1, // Always 1 now, keeping for backwards compatibility
    modulesInTimeline,
  };
}

/**
 * Calculate statistics for enabled modules (timeline and effort)
 */
export function calculateModuleStats(modules: ProjectModule[]): ModuleStats {
  const enabledModules = modules.filter(m => m.isEnabled);

  // Timeline: parallel work (max of frontend/backend per module, summed)
  const timelineDays = enabledModules
    .reduce((sum, m) => sum + Math.max(m.frontendDays, m.backendDays), 0);

  // Effort: sum of all work
  const effortDays = enabledModules
    .reduce((sum, m) => sum + m.frontendDays + m.backendDays, 0);

  return {
    timelineDays,
    effortDays,
  };
}

/**
 * Calculate price for a specific module
 */
export function calculateModulePrice(
  module: ProjectModule,
  rates: RateConfig[]
): number {
  const monthlyFee = rates.reduce((sum, rate) => sum + rate.monthlyRate, 0);
  const moduleTimeline = Math.max(module.frontendDays, module.backendDays);
  return Math.round((monthlyFee / BUSINESS_DAYS_PER_MONTH) * moduleTimeline);
}

/**
 * Calculate prices for all modules
 */
export function calculateModulePrices(
  modules: ProjectModule[],
  rates: RateConfig[]
): ModulePriceCalculation[] {
  return modules.map(module => ({
    moduleId: module.id,
    price: calculateModulePrice(module, rates),
    timelineDays: Math.max(module.frontendDays, module.backendDays),
  }));
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
    discountAmount: monthlyCalculation.discountAmount * months,
    finalTotal: monthlyCalculation.finalTotal * months,
  };
}
