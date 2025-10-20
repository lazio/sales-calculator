import { RateConfig } from '@/types/rates.types';
import { ProjectModule } from '@/types/project.types';

// Constants
export const BUSINESS_DAYS_PER_MONTH = 20;
export const TIMELINE_MIN_PERCENTAGE = 0.5; // 50% of optimal
export const TIMELINE_MAX_PERCENTAGE = 2; // 200% of optimal

export interface QuoteCalculation {
  // Phase breakdown
  designDays: number; // Total design phase days
  developmentDays: number; // Total development phase days (MAX of frontend/backend per module)
  totalDays: number; // Total timeline days (MAX of design and development per module, summed)

  // Cost breakdown
  designCost: number; // Cost of design phase
  developmentCost: number; // Cost of development phase
  totalQuote: number; // Total quote (before discount)

  // Legacy/Reference fields
  monthlyFee: number; // Total monthly fee for all performers (rate card)
  productPrice: number; // Same as totalQuote (backward compatibility)

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
 * - Design and development happen in parallel
 * - Frontend and backend work happens in parallel
 * - Module timeline = MAX(Design, Frontend, Backend)
 * Cost calculation:
 * - Design cost = sum of (design performer daily rates × design days)
 * - Development cost = sum of (development performer daily rates × MAX(frontend, backend) days)
 */
export function calculateQuote(
  rates: RateConfig[],
  modules: ProjectModule[] = [],
  customTimeline?: number,
  discountPercentage: number = 0
): QuoteCalculation {
  const enabledModules = modules.filter(m => m.isEnabled);

  // Helper: Get daily rate for a performer
  const getDailyRate = (performerName: string): number => {
    const rate = rates.find(r => r.role === performerName);
    return rate ? rate.monthlyRate / BUSINESS_DAYS_PER_MONTH : 0;
  };

  // Calculate optimal timeline days
  // Timeline = sum of MAX(Design, Frontend, Backend) per module
  const optimalTimeline = enabledModules
    .reduce((sum, m) => sum + Math.max(m.designDays, m.frontendDays, m.backendDays), 0);

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
      const moduleTime = Math.max(module.designDays, module.frontendDays, module.backendDays);
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

  // Calculate design and development days for included modules
  const totalDesignDays = modulesToInclude.reduce((sum, m) => sum + m.designDays, 0);
  const totalDevelopmentDays = modulesToInclude.reduce((sum, m) => sum + Math.max(m.frontendDays, m.backendDays), 0);

  // Calculate design cost
  let designCost = 0;
  for (const module of modulesToInclude) {
    for (const performer of module.designPerformers) {
      designCost += getDailyRate(performer) * module.designDays;
    }
  }

  // Calculate development cost
  let developmentCost = 0;
  for (const module of modulesToInclude) {
    const devDays = Math.max(module.frontendDays, module.backendDays);
    for (const performer of module.developmentPerformers) {
      developmentCost += getDailyRate(performer) * devDays;
    }
  }

  // Round costs
  designCost = Math.round(designCost);
  developmentCost = Math.round(developmentCost);

  // Total quote = design + development
  const totalQuote = designCost + developmentCost;

  // Calculate total monthly fee for all performers (rate card reference)
  const monthlyFee = rates.reduce((sum, rate) => sum + rate.monthlyRate, 0);

  // Product price represents the actual cost (same as totalQuote for consistency)
  const productPrice = totalQuote;

  // Apply discount
  const discountAmount = Math.round((totalQuote * discountPercentage) / 100);
  const finalTotal = totalQuote - discountAmount;

  return {
    // Phase breakdown
    designDays: totalDesignDays,
    developmentDays: totalDevelopmentDays,
    totalDays: actualTimeline,

    // Cost breakdown
    designCost,
    developmentCost,
    totalQuote,

    // Legacy/Reference fields
    monthlyFee, // Keep for reference (rate card)
    productPrice, // Actual project cost (backward compatibility)

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

  // Timeline: parallel work (max of design/frontend/backend per module, summed)
  const timelineDays = enabledModules
    .reduce((sum, m) => sum + Math.max(m.designDays, m.frontendDays, m.backendDays), 0);

  // Effort: sum of all work
  const effortDays = enabledModules
    .reduce((sum, m) => sum + m.designDays + m.frontendDays + m.backendDays, 0);

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
  // Helper: Get daily rate for a performer
  const getDailyRate = (performerName: string): number => {
    const rate = rates.find(r => r.role === performerName);
    return rate ? rate.monthlyRate / BUSINESS_DAYS_PER_MONTH : 0;
  };

  // Calculate design cost
  let designCost = 0;
  for (const performer of module.designPerformers) {
    designCost += getDailyRate(performer) * module.designDays;
  }

  // Calculate development cost
  const devDays = Math.max(module.frontendDays, module.backendDays);
  let developmentCost = 0;
  for (const performer of module.developmentPerformers) {
    developmentCost += getDailyRate(performer) * devDays;
  }

  return Math.round(designCost + developmentCost);
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
    timelineDays: Math.max(module.designDays, module.frontendDays, module.backendDays),
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
    designDays: monthlyCalculation.designDays * months,
    developmentDays: monthlyCalculation.developmentDays * months,
    designCost: monthlyCalculation.designCost * months,
    developmentCost: monthlyCalculation.developmentCost * months,
    totalQuote: monthlyCalculation.totalQuote * months,
    monthlyFee: monthlyCalculation.monthlyFee * months,
    productPrice: monthlyCalculation.productPrice * months,
    discountAmount: monthlyCalculation.discountAmount * months,
    finalTotal: monthlyCalculation.finalTotal * months,
  };
}
