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
  // Mock team with monthly rates totaling $23,000/month
  // Individual daily rates:
  // - UI Designer: $4,000/month = $200/day
  // - Frontend Developer: $5,000/month = $250/day
  // - Backend Developer: $5,000/month = $250/day
  // - QA Engineer: $4,000/month = $200/day
  // - PM: $5,000/month = $250/day
  const mockRates: RateConfig[] = [
    { role: 'UI Designer', monthlyRate: 4000 },
    { role: 'Frontend Developer', monthlyRate: 5000 },
    { role: 'Backend Developer', monthlyRate: 5000 },
    { role: 'QA Engineer', monthlyRate: 4000 },
    { role: 'PM', monthlyRate: 5000 },
  ];

  // Mock project modules
  // Timeline calculation uses MAX(design, frontend, backend) since work happens in parallel
  const mockModules: ProjectModule[] = [
    {
      id: 'module-1',
      name: 'Authentication',
      designDays: 3,     // Design: 3 days
      frontendDays: 5,   // Frontend: 5 days
      backendDays: 8,    // Backend: 8 days (longer)
      designPerformers: ['UI Designer'],
      developmentPerformers: ['Frontend Developer', 'Backend Developer'],
      isEnabled: true,   // Duration: MAX(3, 5, 8) = 8 days
    },
    {
      id: 'module-2',
      name: 'Dashboard',
      designDays: 4,     // Design: 4 days
      frontendDays: 10,  // Frontend: 10 days (longer)
      backendDays: 6,    // Backend: 6 days
      designPerformers: ['UI Designer'],
      developmentPerformers: ['Frontend Developer', 'Backend Developer'],
      isEnabled: true,   // Duration: MAX(4, 10, 6) = 10 days
    },
    {
      id: 'module-3',
      name: 'Reporting',
      designDays: 2,     // Design: 2 days
      frontendDays: 7,   // Frontend: 7 days
      backendDays: 9,    // Backend: 9 days (longer)
      designPerformers: ['UI Designer'],
      developmentPerformers: ['Frontend Developer', 'Backend Developer'],
      isEnabled: false,  // Disabled - Duration: MAX(2, 7, 9) = 9 days
    },
  ];
  // NEW PARALLEL LOGIC:
  // Enabled modules (1 & 2): design=3+4=7, frontend=5+10=15, backend=8+6=14 → timeline=MAX(7,15,14)=15 days
  // All modules enabled (1,2,3): design=3+4+2=9, frontend=5+10+7=22, backend=8+6+9=23 → timeline=MAX(9,22,23)=23 days

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

      // Timeline: MAX(total design, total frontend, total backend) = MAX(7, 15, 14) = 15 days
      expect(stats.timelineDays).toBe(15);

      // Effort: (3+5+8) + (4+10+6) = 16 + 20 = 36 days
      expect(stats.effortDays).toBe(36);
    });

    it('should return zero for empty modules', () => {
      const stats = calculateModuleStats([]);

      expect(stats.timelineDays).toBe(0);
      expect(stats.effortDays).toBe(0);
    });

    it('should only count enabled modules', () => {
      const allEnabled = mockModules.map(m => ({ ...m, isEnabled: true }));
      const stats = calculateModuleStats(allEnabled);

      // Timeline: MAX(total design, total frontend, total backend) = MAX(9, 22, 23) = 23 days
      expect(stats.timelineDays).toBe(23);

      // Effort: (3+5+8) + (4+10+6) + (2+7+9) = 16 + 20 + 18 = 54 days
      expect(stats.effortDays).toBe(54);
    });
  });

  describe('calculateModulePrice', () => {
    it('should calculate module price correctly', () => {
      const module = mockModules[0]; // 3 design, 5 frontend, 8 backend

      const price = calculateModulePrice(module, mockRates);

      // Design: UI Designer ($200/day) × 3 days = $600
      // Development: (Frontend $250 + Backend $250) × MAX(5,8)=8 days = $4000
      // Total: $600 + $4000 = $4600
      expect(price).toBe(4600);
    });

    it('should handle frontend-heavy modules', () => {
      const module = mockModules[1]; // 4 design, 10 frontend, 6 backend
      const price = calculateModulePrice(module, mockRates);

      // Design: UI Designer ($200/day) × 4 days = $800
      // Development: (Frontend $250 + Backend $250) × MAX(10,6)=10 days = $5000
      // Total: $800 + $5000 = $5800
      expect(price).toBe(5800);
    });
  });

  describe('calculateModulePrices', () => {
    it('should calculate prices for all modules', () => {
      const prices = calculateModulePrices(mockModules, mockRates);

      expect(prices).toHaveLength(3);
      expect(prices[0]).toEqual({
        moduleId: 'module-1',
        price: 4600, // $600 design + $4000 dev
        timelineDays: 8, // MAX(3,5,8)
      });
      expect(prices[1]).toEqual({
        moduleId: 'module-2',
        price: 5800, // $800 design + $5000 dev
        timelineDays: 10, // MAX(4,10,6)
      });
      expect(prices[2]).toEqual({
        moduleId: 'module-3',
        price: 4900, // $400 design + $4500 dev
        timelineDays: 9, // MAX(2,7,9)
      });
    });
  });

  describe('calculateQuote', () => {
    it('should calculate design costs separately from development', () => {
      // Test: Design cost calculation with specific performers
      const quote = calculateQuote(mockRates, mockModules);

      // Verify design days and cost are tracked separately
      expect(quote.designDays).toBe(7); // 3 + 4 from enabled modules
      expect(quote.designCost).toBe(1400); // UI Designer @ $200/day × 7 days

      // Verify development is separate
      expect(quote.developmentDays).toBe(18); // MAX(5,8)=8 + MAX(10,6)=10
      expect(quote.developmentCost).toBe(9000); // (FE + BE) @ $500/day × 18 days
    });

    it('should handle modules with no design performers', () => {
      const moduleWithoutDesign: ProjectModule = {
        id: 'module-no-design',
        name: 'API Only',
        designDays: 0,
        frontendDays: 5,
        backendDays: 5,
        designPerformers: [],
        developmentPerformers: ['Frontend Developer', 'Backend Developer'],
        isEnabled: true,
      };

      const quote = calculateQuote(mockRates, [moduleWithoutDesign]);

      expect(quote.designDays).toBe(0);
      expect(quote.designCost).toBe(0);
      expect(quote.developmentCost).toBeGreaterThan(0);
    });

    it('should handle missing performer rates gracefully', () => {
      const moduleWithUnknownPerformer: ProjectModule = {
        id: 'module-unknown',
        name: 'Unknown Performer Module',
        designDays: 3,
        frontendDays: 5,
        backendDays: 5,
        designPerformers: ['Unknown Designer'], // Not in rates
        developmentPerformers: ['Frontend Developer'],
        isEnabled: true,
      };

      const quote = calculateQuote(mockRates, [moduleWithUnknownPerformer]);

      // Design cost should be 0 since performer not found
      expect(quote.designCost).toBe(0);
      // Development should still work
      expect(quote.developmentCost).toBeGreaterThan(0);
    });

    it('should calculate basic quote with no customization', () => {
      // Test: Calculate based on individual performer rates
      const quote = calculateQuote(mockRates, mockModules);

      const totalMonthlyRate = 23000; // Sum of all monthly rates
      const timelineDays = 15; // MAX(7 design, 15 frontend, 14 backend) - parallel modules

      // Module 1: Design $600 + Dev $4000 = $4600
      // Module 2: Design $800 + Dev $5000 = $5800
      // Total: $4600 + $5800 = $10,400
      const expectedTotal = 10400;

      expect(quote.monthlyFee).toBe(totalMonthlyRate); // Reference rate card
      expect(quote.totalDays).toBe(timelineDays);
      expect(quote.designDays).toBe(7); // 3 + 4
      expect(quote.developmentDays).toBe(18); // 8 + 10
      expect(quote.designCost).toBe(1400); // $600 + $800
      expect(quote.developmentCost).toBe(9000); // $4000 + $5000
      expect(quote.productPrice).toBe(expectedTotal); // Same as totalQuote
      expect(quote.totalQuote).toBe(expectedTotal);
      expect(quote.discountAmount).toBe(0);
      expect(quote.finalTotal).toBe(quote.totalQuote);
      expect(quote.modulesInTimeline).toEqual(['module-1', 'module-2']);
    });

    it('should apply discount correctly', () => {
      // Test: Discount reduces final price
      const discount = 10; // 10% discount
      const quote = calculateQuote(mockRates, mockModules, undefined, discount);

      const totalQuote = 10400; // $4600 + $5800
      const discountAmount = Math.round((totalQuote * discount) / 100); // $1,040 (10%)

      expect(quote.totalQuote).toBe(totalQuote); // $10,400 before discount
      expect(quote.discountAmount).toBe(discountAmount); // $1,040
      expect(quote.finalTotal).toBe(totalQuote - discountAmount); // $9,360 after discount
    });

    it('should handle custom timeline', () => {
      // Test: With new logic, custom timeline same as optimal means all modules fit
      const customTimeline = 15; // Same as optimal
      const quote = calculateQuote(mockRates, mockModules, customTimeline);

      expect(quote.totalDays).toBe(customTimeline); // 15 days
      expect(quote.totalQuote).toBe(10400); // Same as basic test
      expect(quote.modulesInTimeline).toEqual(['module-1', 'module-2']); // All modules fit
    });

    it('should handle compressed timeline', () => {
      // Test: Compressed timeline - some modules excluded
      // Use case: Tight deadline, MVP delivery
      const compressedTimeline = 10; // User wants faster (optimal is 15 days)
      const quote = calculateQuote(mockRates, mockModules, compressedTimeline);

      expect(quote.totalDays).toBe(compressedTimeline); // 10 days timeline
      // With parallel logic: module-1 alone has MAX(3, 5, 8) = 8 days, fits in 10
      // Adding module-2 would give MAX(7, 15, 14) = 15 days, too much
      expect(quote.modulesInTimeline).toEqual(['module-1']); // Only Auth included
      expect(quote.totalQuote).toBe(4600); // Only module-1: $600 + $4000
    });

    it('should handle very compressed timeline', () => {
      const veryCompressedTimeline = 5; // Very tight (module-1 needs MAX(3,5,8)=8 days)
      const quote = calculateQuote(mockRates, mockModules, veryCompressedTimeline);

      expect(quote.totalDays).toBe(veryCompressedTimeline);
      // No modules fit (module-1 needs 8 days)
      expect(quote.modulesInTimeline).toEqual([]);
      expect(quote.totalQuote).toBe(0); // No modules = no cost
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
      const quote = calculateQuote(mockRates, mockModules, 15);

      expect(quote.modulesInTimeline).toEqual(['module-1', 'module-2']);
    });

    it('should handle extended timeline', () => {
      // Extended timeline not supported - max = optimal
      // So this behaves same as optimal timeline
      const extendedTimeline = 15; // Can't go above optimal with new logic
      const quote = calculateQuote(mockRates, mockModules, extendedTimeline);

      expect(quote.totalDays).toBe(extendedTimeline);
      expect(quote.modulesInTimeline).toEqual(['module-1', 'module-2']);
      expect(quote.totalQuote).toBe(10400);
    });

    it('should calculate correctly with discount and custom timeline', () => {
      // Test: Combined scenario - custom timeline + discount
      const customTimeline = 15; // Optimal timeline
      const discount = 15; // 15% discount negotiated
      const quote = calculateQuote(mockRates, mockModules, customTimeline, discount);

      const totalQuote = 10400; // $4600 + $5800
      const discountAmount = Math.round((totalQuote * discount) / 100); // $1,560 (15%)

      expect(quote.totalQuote).toBe(totalQuote); // $10,400 before discount
      expect(quote.discountAmount).toBe(discountAmount); // $1,560
      expect(quote.finalTotal).toBe(totalQuote - discountAmount); // $8,840 final price
    });
  });
});
