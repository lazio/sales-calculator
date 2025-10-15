import { describe, it, expect } from 'vitest';
import {
  calculateQuote,
  calculateModuleStats,
  calculateModulePrice,
  calculateModulePrices,
  BUSINESS_DAYS_PER_MONTH,
  TIMELINE_MIN_PERCENTAGE,
  TIMELINE_MAX_PERCENTAGE,
} from './calculationEngine';
import { RateConfig } from '@/types/rates.types';
import { ProjectModule } from '@/types/project.types';

describe('calculationEngine', () => {
  // Mock team with monthly rates totaling $20,000/month
  // Daily rate: $20,000 / 20 business days = $1,000/day
  const mockRates: RateConfig[] = [
    { role: 'Frontend Developer', monthlyRate: 5000 },
    { role: 'Backend Developer', monthlyRate: 5000 },
    { role: 'QA Engineer', monthlyRate: 4000 },
    { role: 'Project Manager', monthlyRate: 6000 },
  ];

  // Mock project modules
  // Timeline calculation uses MAX(frontend, backend) since work happens in parallel
  const mockModules: ProjectModule[] = [
    {
      id: 'module-1',
      name: 'Authentication',
      frontendDays: 5,   // Frontend: 5 days
      backendDays: 8,    // Backend: 8 days (longer)
      performers: ['Frontend Dev', 'Backend Dev'],
      isEnabled: true,   // Duration: MAX(5, 8) = 8 days
    },
    {
      id: 'module-2',
      name: 'Dashboard',
      frontendDays: 10,  // Frontend: 10 days (longer)
      backendDays: 6,    // Backend: 6 days
      performers: ['Frontend Dev', 'Backend Dev'],
      isEnabled: true,   // Duration: MAX(10, 6) = 10 days
    },
    {
      id: 'module-3',
      name: 'Reporting',
      frontendDays: 7,   // Frontend: 7 days
      backendDays: 9,    // Backend: 9 days (longer)
      performers: ['Frontend Dev', 'Backend Dev'],
      isEnabled: false,  // Disabled - Duration: MAX(7, 9) = 9 days
    },
  ];
  // Total timeline (enabled only): 8 + 10 = 18 days
  // Total timeline (all enabled): 8 + 10 + 9 = 27 days

  describe('Constants', () => {
    it('should have correct constant values', () => {
      expect(BUSINESS_DAYS_PER_MONTH).toBe(20);
      expect(TIMELINE_MIN_PERCENTAGE).toBe(0.5);
      expect(TIMELINE_MAX_PERCENTAGE).toBe(2);
    });
  });

  describe('calculateModuleStats', () => {
    it('should calculate timeline and effort correctly for enabled modules', () => {
      const stats = calculateModuleStats(mockModules);

      // Timeline: max(5,8) + max(10,6) = 8 + 10 = 18 days
      expect(stats.timelineDays).toBe(18);

      // Effort: (5+8) + (10+6) = 13 + 16 = 29 days
      expect(stats.effortDays).toBe(29);
    });

    it('should return zero for empty modules', () => {
      const stats = calculateModuleStats([]);

      expect(stats.timelineDays).toBe(0);
      expect(stats.effortDays).toBe(0);
    });

    it('should only count enabled modules', () => {
      const allEnabled = mockModules.map(m => ({ ...m, isEnabled: true }));
      const stats = calculateModuleStats(allEnabled);

      // Timeline: max(5,8) + max(10,6) + max(7,9) = 8 + 10 + 9 = 27 days
      expect(stats.timelineDays).toBe(27);

      // Effort: (5+8) + (10+6) + (7+9) = 13 + 16 + 16 = 45 days
      expect(stats.effortDays).toBe(45);
    });
  });

  describe('calculateModulePrice', () => {
    it('should calculate module price correctly', () => {
      const module = mockModules[0]; // 5 frontend, 8 backend

      const price = calculateModulePrice(module, mockRates);

      // Timeline: max(5, 8) = 8 days
      // Total monthly rate: 20000 (5000 + 5000 + 4000 + 6000)
      // Price: (20000 / 20) * 8 = 1000 * 8 = 8000
      expect(price).toBe(8000);
    });

    it('should handle frontend-heavy modules', () => {
      const module = mockModules[1]; // 10 frontend, 6 backend
      const price = calculateModulePrice(module, mockRates);

      // Timeline: max(10, 6) = 10 days
      // Price: (20000 / 20) * 10 = 10000
      expect(price).toBe(10000);
    });
  });

  describe('calculateModulePrices', () => {
    it('should calculate prices for all modules', () => {
      const prices = calculateModulePrices(mockModules, mockRates);

      expect(prices).toHaveLength(3);
      expect(prices[0]).toEqual({
        moduleId: 'module-1',
        price: 8000,
        timelineDays: 8,
      });
      expect(prices[1]).toEqual({
        moduleId: 'module-2',
        price: 10000,
        timelineDays: 10,
      });
      expect(prices[2]).toEqual({
        moduleId: 'module-3',
        price: 9000,
        timelineDays: 9,
      });
    });
  });

  describe('calculateQuote', () => {
    it('should calculate basic quote with no customization', () => {
      // Test: Basic time & materials calculation
      // Formula: (Monthly Rate / 20 days) × Timeline Days
      const quote = calculateQuote(mockRates, mockModules);

      const totalMonthlyRate = 20000; // Sum of all monthly rates
      const timelineDays = 18; // Auth(8d) + Dashboard(10d) - only enabled modules
      const dailyRate = totalMonthlyRate / 20; // $1,000/day
      const expectedTotal = Math.round(dailyRate * timelineDays); // $1,000 × 18 = $18,000

      expect(quote.monthlyFee).toBe(totalMonthlyRate); // Reference rate card
      expect(quote.totalDays).toBe(timelineDays);
      expect(quote.productPrice).toBe(expectedTotal); // Same as totalQuote
      expect(quote.totalQuote).toBe(expectedTotal); // $18,000 (time & materials)
      expect(quote.discountAmount).toBe(0);
      expect(quote.finalTotal).toBe(quote.totalQuote);
      expect(quote.modulesInTimeline).toEqual(['module-1', 'module-2']);
    });

    it('should apply discount correctly', () => {
      // Test: Discount reduces final price, not daily rate
      const discount = 10; // 10% discount
      const quote = calculateQuote(mockRates, mockModules, undefined, discount);

      const timelineDays = 18;
      const totalQuote = Math.round((20000 / 20) * timelineDays); // $18,000
      const discountAmount = Math.round((totalQuote * discount) / 100); // $1,800 (10%)

      expect(quote.totalQuote).toBe(totalQuote); // $18,000 before discount
      expect(quote.discountAmount).toBe(discountAmount); // $1,800
      expect(quote.finalTotal).toBe(totalQuote - discountAmount); // $16,200 after discount
    });

    it('should handle custom timeline', () => {
      // Test: Extended timeline - paying for more days than needed
      // Use case: Buffer time, quality improvements, reduced pressure
      const customTimeline = 30; // User wants 30 days (optimal is 18)
      const quote = calculateQuote(mockRates, mockModules, customTimeline);

      const totalMonthlyRate = 20000;
      const expectedTotal = Math.round((totalMonthlyRate / 20) * customTimeline); // $30,000

      expect(quote.totalDays).toBe(customTimeline); // 30 days requested
      expect(quote.productPrice).toBe(expectedTotal);
      expect(quote.totalQuote).toBe(expectedTotal); // $30,000 (paying for 30 days)
      expect(quote.modulesInTimeline).toEqual(['module-1', 'module-2']); // All modules still fit
    });

    it('should handle compressed timeline', () => {
      // Test: Compressed timeline - some modules excluded
      // Use case: Tight deadline, MVP delivery
      const compressedTimeline = 10; // User wants faster (optimal is 18 days)
      const quote = calculateQuote(mockRates, mockModules, compressedTimeline);

      expect(quote.totalDays).toBe(compressedTimeline); // 10 days timeline
      // Module fitting: Auth(8d) fits, Dashboard(10d) doesn't fit in remaining 2 days
      expect(quote.modulesInTimeline).toEqual(['module-1']); // Only Auth included
      expect(quote.totalQuote).toBe(10000); // $1,000/day × 10 days
    });

    it('should handle very compressed timeline', () => {
      const veryCompressedTimeline = 5; // Very tight
      const quote = calculateQuote(mockRates, mockModules, veryCompressedTimeline);

      expect(quote.totalDays).toBe(veryCompressedTimeline);
      // No modules fit
      expect(quote.modulesInTimeline).toEqual([]);
    });

    it('should handle empty modules', () => {
      const quote = calculateQuote(mockRates, []);

      expect(quote.totalDays).toBe(0);
      expect(quote.productPrice).toBe(0);
      expect(quote.totalQuote).toBe(0); // No days = no cost
      expect(quote.modulesInTimeline).toEqual([]);
    });

    it('should handle empty rates', () => {
      const quote = calculateQuote([], mockModules);

      expect(quote.monthlyFee).toBe(0);
      expect(quote.productPrice).toBe(0);
      expect(quote.totalQuote).toBe(0);
      expect(quote.finalTotal).toBe(0);
    });

    it('should include all enabled modules in normal timeline', () => {
      const quote = calculateQuote(mockRates, mockModules, 18);

      expect(quote.modulesInTimeline).toEqual(['module-1', 'module-2']);
    });

    it('should handle extended timeline', () => {
      const extendedTimeline = 50;
      const quote = calculateQuote(mockRates, mockModules, extendedTimeline);

      expect(quote.totalDays).toBe(extendedTimeline);
      expect(quote.modulesInTimeline).toEqual(['module-1', 'module-2']);
    });

    it('should calculate correctly with discount and custom timeline', () => {
      // Test: Combined scenario - custom timeline + discount
      // Real-world: Client wants specific timeline with negotiated discount
      const customTimeline = 25; // 25 days requested
      const discount = 15; // 15% discount negotiated
      const quote = calculateQuote(mockRates, mockModules, customTimeline, discount);

      const totalMonthlyRate = 20000;
      const totalQuote = Math.round((totalMonthlyRate / 20) * customTimeline); // $25,000
      const discountAmount = Math.round((totalQuote * discount) / 100); // $3,750 (15%)

      expect(quote.totalQuote).toBe(totalQuote); // $25,000 before discount
      expect(quote.discountAmount).toBe(discountAmount); // $3,750
      expect(quote.finalTotal).toBe(totalQuote - discountAmount); // $21,250 final price
    });
  });
});
