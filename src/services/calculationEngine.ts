import { RateConfig } from '@/types/rates.types';
import { ProjectModule } from '@/types/project.types';

// Constants
export const BUSINESS_DAYS_PER_MONTH = 20;
export const TIMELINE_MIN_PERCENTAGE = 0.5; // 50% of optimal
export const TIMELINE_MAX_PERCENTAGE = 2; // 200% of optimal

export interface QuoteCalculation {
  // Phase breakdown
  designDays: number; // Total design phase days (sum of all design days)
  developmentDays: number; // Total development phase days (sum of MAX(frontend, backend) per module)
  totalDays: number; // Total timeline days (design + dev - overlap)

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
 * Timeline calculation with overlap:
 * - All modules work in parallel (simultaneously)
 * - Design and development can overlap based on overlapDays parameter
 * - overlapDays = 0: Sequential (Design → Development)
 * - overlapDays > 0: Development starts after N days of design
 * - overlapDays >= designDays: Fully parallel (current behavior)
 * - Project timeline = designDays + MAX(frontendDays, backendDays) - overlapDays
 * Cost calculation:
 * - Design cost = sum of (design performer daily rates × design days)
 * - Development cost = sum of (development performer daily rates × MAX(frontend, backend) days per module)
 */
export function calculateQuote(
  rates: RateConfig[],
  modules: ProjectModule[] = [],
  discountPercentage: number = 0,
  overlapDays: number = Infinity // Default: fully parallel (backward compatible)
): QuoteCalculation {
  const enabledModules = modules.filter(m => m.isEnabled);

  // Helper: Get daily rate for a performer (with discount applied)
  const getDailyRate = (performerName: string): number => {
    const rate = rates.find(r => r.role === performerName);
    if (!rate) return 0;

    // Apply per-performer discount if present
    const discount = rate.discount || 0;
    const effectiveMonthlyRate = rate.monthlyRate * (1 - discount / 100);
    return effectiveMonthlyRate / BUSINESS_DAYS_PER_MONTH;
  };

  // Calculate timeline days with overlap
  // All modules work in parallel, design and dev overlap based on overlapDays
  const totalDesignDays = enabledModules.reduce((sum, m) => sum + m.designDays, 0);

  // Development days represents effort per performer (sum of MAX per module)
  // This is what each development performer bills for and the actual dev timeline
  const totalDevelopmentDays = enabledModules.reduce((sum, m) => sum + Math.max(m.frontendDays, m.backendDays), 0);

  // Calculate actual overlap (can't overlap more than design days or dev days)
  const actualOverlap = Math.min(overlapDays, totalDesignDays, totalDevelopmentDays);

  // Timeline = design days + dev days - overlap
  // If overlap >= both phases, they're fully parallel = MAX(design, dev)
  const totalTimeline = totalDesignDays + totalDevelopmentDays - actualOverlap;

  // Calculate design cost
  let designCost = 0;
  for (const module of enabledModules) {
    for (const performer of module.designPerformers) {
      designCost += getDailyRate(performer) * module.designDays;
    }
  }

  // Calculate development cost
  let developmentCost = 0;
  for (const module of enabledModules) {
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
    totalDays: totalTimeline,

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
  };
}

/**
 * Calculate statistics for enabled modules (timeline and effort)
 */
export function calculateModuleStats(modules: ProjectModule[], overlapDays: number = Infinity): ModuleStats {
  const enabledModules = modules.filter(m => m.isEnabled);

  // Timeline: all modules work in parallel, design and dev overlap based on overlapDays
  const totalDesign = enabledModules.reduce((sum, m) => sum + m.designDays, 0);
  const totalDevDays = enabledModules.reduce((sum, m) => sum + Math.max(m.frontendDays, m.backendDays), 0);

  // Calculate actual overlap
  const actualOverlap = Math.min(overlapDays, totalDesign, totalDevDays);

  // Timeline with overlap
  const timelineDays = totalDesign + totalDevDays - actualOverlap;

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
  // Helper: Get daily rate for a performer (with discount applied)
  const getDailyRate = (performerName: string): number => {
    const rate = rates.find(r => r.role === performerName);
    if (!rate) return 0;

    // Apply per-performer discount if present
    const discount = rate.discount || 0;
    const effectiveMonthlyRate = rate.monthlyRate * (1 - discount / 100);
    return effectiveMonthlyRate / BUSINESS_DAYS_PER_MONTH;
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
): Omit<QuoteCalculation, 'totalDays' | 'teamSizeMultiplier'> {
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
