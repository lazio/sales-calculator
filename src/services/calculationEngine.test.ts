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

  describe('calculateQuote with overlap', () => {
    it('should calculate timeline with full parallel (default behavior)', () => {
      // When overlapDays >= min(design, dev), work is fully parallel
      const quote = calculateQuote(mockRates, mockModules, undefined, 0, Infinity);

      // Design: 7 days, Dev: MAX(15, 14) = 15 days
      // Fully parallel: MAX(7, 15) = 15 days
      expect(quote.totalDays).toBe(15);
      expect(quote.designDays).toBe(7);
      expect(quote.developmentDays).toBe(18); // Sum of MAX per module: 8 + 10
    });

    it('should calculate timeline with zero overlap (sequential)', () => {
      // Sequential: design completes, then development starts
      const overlapDays = 0;
      const quote = calculateQuote(mockRates, mockModules, undefined, 0, overlapDays);

      // Design: 7 days, Dev: 15 days
      // Sequential: 7 + 15 - 0 = 22 days
      expect(quote.totalDays).toBe(22);
      expect(quote.totalQuote).toBe(10400); // Cost doesn't change
    });

    it('should calculate timeline with partial overlap (1 month / 20 days)', () => {
      // Development starts 20 days (4 weeks) after design begins
      const overlapDays = 20;
      const quote = calculateQuote(mockRates, mockModules, undefined, 0, overlapDays);

      // Design: 7 days, Dev: 15 days
      // Overlap limited by min(7, 15) = 7 days
      // Timeline: 7 + 15 - 7 = 15 days (same as fully parallel since overlap > design)
      expect(quote.totalDays).toBe(15);
    });

    it('should calculate timeline with 5 days overlap (1 week)', () => {
      // Development starts 1 week after design begins
      const overlapDays = 5;
      const quote = calculateQuote(mockRates, mockModules, undefined, 0, overlapDays);

      // Design: 7 days, Dev: 15 days
      // Timeline: 7 + 15 - 5 = 17 days
      expect(quote.totalDays).toBe(17);
      expect(quote.totalQuote).toBe(10400); // Cost unchanged
    });

    it('should calculate timeline with 10 days overlap (2 weeks)', () => {
      const overlapDays = 10;
      const quote = calculateQuote(mockRates, mockModules, undefined, 0, overlapDays);

      // Design: 7 days, Dev: 15 days
      // Overlap limited by min(7, 15) = 7 days (can't overlap more than shortest phase)
      // Timeline: 7 + 15 - 7 = 15 days
      expect(quote.totalDays).toBe(15);
    });

    it('should handle overlap with compressed timeline', () => {
      // Compressed timeline with 5 days overlap
      const overlapDays = 5;
      const compressedTimeline = 12;
      const quote = calculateQuote(mockRates, mockModules, compressedTimeline, 0, overlapDays);

      expect(quote.totalDays).toBe(compressedTimeline);
      // Module-1: design=3, dev=MAX(5,8)=8, overlap=min(5,3,8)=3 → timeline=3+8-3=8 days (fits)
      // Both modules: design=7, dev=15, overlap=min(5,7,15)=5 → timeline=7+15-5=17 days (doesn't fit in 12)
      expect(quote.modulesInTimeline).toEqual(['module-1']);
    });

    it('should not reduce cost when applying overlap', () => {
      const noOverlap = calculateQuote(mockRates, mockModules, undefined, 0, 0);
      const withOverlap = calculateQuote(mockRates, mockModules, undefined, 0, 10);

      // Cost should be the same regardless of overlap (only timeline changes)
      expect(noOverlap.totalQuote).toBe(withOverlap.totalQuote);
      expect(noOverlap.designCost).toBe(withOverlap.designCost);
      expect(noOverlap.developmentCost).toBe(withOverlap.developmentCost);

      // Timeline should be different
      expect(noOverlap.totalDays).toBeGreaterThan(withOverlap.totalDays);
    });

    it('should handle overlap with all modules enabled', () => {
      const allEnabled = mockModules.map(m => ({ ...m, isEnabled: true }));
      const overlapDays = 10;
      const quote = calculateQuote(mockRates, allEnabled, undefined, 0, overlapDays);

      // Design: 9 days, Dev: MAX(22, 23) = 23 days
      // Overlap: min(10, 9, 23) = 9 days
      // Timeline: 9 + 23 - 9 = 23 days
      expect(quote.totalDays).toBe(23);
      expect(quote.modulesInTimeline).toHaveLength(3);
    });

    it('should handle overlap larger than both phases', () => {
      const overlapDays = 100; // Much larger than design (7d) or dev (15d)
      const quote = calculateQuote(mockRates, mockModules, undefined, 0, overlapDays);

      // Should be clamped to min(design, dev) = 7 days
      // Timeline: 7 + 15 - 7 = 15 days (fully parallel)
      expect(quote.totalDays).toBe(15);
    });
  });

  describe('calculateModuleStats with overlap', () => {
    it('should calculate timeline with full parallel', () => {
      const stats = calculateModuleStats(mockModules, Infinity);

      // Fully parallel: MAX(7 design, 15 dev) = 15 days
      expect(stats.timelineDays).toBe(15);
      expect(stats.effortDays).toBe(36);
    });

    it('should calculate timeline with zero overlap', () => {
      const stats = calculateModuleStats(mockModules, 0);

      // Sequential: 7 + 15 - 0 = 22 days
      expect(stats.timelineDays).toBe(22);
      expect(stats.effortDays).toBe(36); // Effort unchanged
    });

    it('should calculate timeline with partial overlap', () => {
      const stats = calculateModuleStats(mockModules, 5);

      // Design: 7 days, Dev: 15 days
      // Timeline: 7 + 15 - 5 = 17 days
      expect(stats.timelineDays).toBe(17);
      expect(stats.effortDays).toBe(36);
    });

    it('should limit overlap to shorter phase', () => {
      const stats = calculateModuleStats(mockModules, 10);

      // Overlap limited to min(7 design, 15 dev) = 7 days
      // Timeline: 7 + 15 - 7 = 15 days
      expect(stats.timelineDays).toBe(15);
    });
  });

  describe('Real-world scenario tests', () => {
    it('should handle typical project with 1 month design lead time', () => {
      // Common scenario: Dev starts 1 month after design
      const overlapDays = 20; // 1 month in business days
      const quote = calculateQuote(mockRates, mockModules, undefined, 0, overlapDays);

      // Design: 7 days (less than 1 month), so fully parallel
      expect(quote.totalDays).toBe(15);
      expect(quote.totalQuote).toBe(10400);
    });

    it('should handle enterprise project with 2-week sprints', () => {
      // Dev starts after 2 sprint cycles (4 weeks)
      const overlapDays = 20; // 4 weeks
      const discount = 10; // Enterprise discount
      const quote = calculateQuote(mockRates, mockModules, undefined, discount, overlapDays);

      expect(quote.finalTotal).toBe(9360); // $10,400 - 10%
    });

    it('should handle MVP with tight timeline and partial overlap', () => {
      const overlapDays = 5; // 1 week overlap
      const compressedTimeline = 10; // MVP deadline
      const quote = calculateQuote(mockRates, mockModules, compressedTimeline, 0, overlapDays);

      expect(quote.totalDays).toBe(10);
      expect(quote.modulesInTimeline).toEqual(['module-1']); // Only critical module
      expect(quote.totalQuote).toBe(4600); // Reduced scope
    });
  });

  describe('Edge cases and boundary conditions', () => {
    it('should handle module with only design work', () => {
      const designOnlyModule: ProjectModule = {
        id: 'design-only',
        name: 'Design System',
        designDays: 15,
        frontendDays: 0,
        backendDays: 0,
        designPerformers: ['UI Designer'],
        developmentPerformers: [],
        isEnabled: true,
      };

      const quote = calculateQuote(mockRates, [designOnlyModule]);

      expect(quote.designDays).toBe(15);
      expect(quote.developmentDays).toBe(0);
      expect(quote.totalDays).toBe(15);
      expect(quote.designCost).toBe(3000); // 15 days * $200/day
      expect(quote.developmentCost).toBe(0);
      expect(quote.totalQuote).toBe(3000);
    });

    it('should handle module with only development work', () => {
      const devOnlyModule: ProjectModule = {
        id: 'dev-only',
        name: 'API Migration',
        designDays: 0,
        frontendDays: 0,
        backendDays: 20,
        designPerformers: [],
        developmentPerformers: ['Backend Developer'],
        isEnabled: true,
      };

      const quote = calculateQuote(mockRates, [devOnlyModule]);

      expect(quote.designDays).toBe(0);
      expect(quote.developmentDays).toBe(20);
      expect(quote.totalDays).toBe(20);
      expect(quote.designCost).toBe(0);
      expect(quote.developmentCost).toBe(5000); // 20 days * $250/day
      expect(quote.totalQuote).toBe(5000);
    });

    it('should handle very large discount (100%)', () => {
      const quote = calculateQuote(mockRates, mockModules, undefined, 100);

      expect(quote.totalQuote).toBe(10400); // Original price
      expect(quote.discountAmount).toBe(10400); // Full discount
      expect(quote.finalTotal).toBe(0); // Free!
    });

    it('should handle module with asymmetric frontend/backend days', () => {
      const asymmetricModule: ProjectModule = {
        id: 'frontend-heavy',
        name: 'UI Intensive',
        designDays: 5,
        frontendDays: 40,
        backendDays: 5,
        designPerformers: ['UI Designer'],
        developmentPerformers: ['Frontend Developer', 'Backend Developer'],
        isEnabled: true,
      };

      const quote = calculateQuote(mockRates, [asymmetricModule]);

      // Design: 5 days * $200 = $1000
      // Development: Both performers work for MAX(40, 5) = 40 days
      // Frontend Dev: 40 days * $250 = $10,000
      // Backend Dev: 40 days * $250 = $10,000 (works full duration even though backend is only 5 days)
      // Total: $1000 + $20,000 = $21,000
      expect(quote.designCost).toBe(1000);
      expect(quote.totalQuote).toBe(21000);
      expect(quote.totalDays).toBe(40); // MAX(5, 40, 5)
    });

    it('should handle timeline compression that excludes all modules', () => {
      const tooCompressed = 1; // 1 day timeline
      const quote = calculateQuote(mockRates, mockModules, tooCompressed);

      expect(quote.totalDays).toBe(1);
      expect(quote.modulesInTimeline).toEqual([]);
      expect(quote.totalQuote).toBe(0);
      expect(quote.designCost).toBe(0);
      expect(quote.developmentCost).toBe(0);
    });

    it('should handle multiple modules with different performers', () => {
      const modules: ProjectModule[] = [
        {
          id: 'm1',
          name: 'Module 1',
          designDays: 5,
          frontendDays: 10,
          backendDays: 0,
          designPerformers: ['UI Designer'],
          developmentPerformers: ['Frontend Developer'],
          isEnabled: true,
        },
        {
          id: 'm2',
          name: 'Module 2',
          designDays: 0,
          frontendDays: 0,
          backendDays: 15,
          designPerformers: [],
          developmentPerformers: ['Backend Developer'],
          isEnabled: true,
        },
      ];

      const quote = calculateQuote(mockRates, modules);

      // Module 1: Design $1000 + Frontend $2500 = $3500
      // Module 2: Backend $3750 = $3750
      // Total: $7250
      expect(quote.totalQuote).toBe(7250);
      expect(quote.totalDays).toBe(15); // MAX(5, 10, 15)
    });

    it('should handle overlap with design-only project', () => {
      const designOnlyModule: ProjectModule = {
        id: 'design',
        name: 'Design Phase',
        designDays: 20,
        frontendDays: 0,
        backendDays: 0,
        designPerformers: ['UI Designer'],
        developmentPerformers: [],
        isEnabled: true,
      };

      const quote = calculateQuote(mockRates, [designOnlyModule], undefined, 0, 10);

      // No dev work, so overlap doesn't affect timeline
      // Timeline: 20 + 0 - min(10, 20, 0) = 20 + 0 - 0 = 20 days
      expect(quote.totalDays).toBe(20);
    });

    it('should handle overlap with dev-only project', () => {
      const devOnlyModule: ProjectModule = {
        id: 'dev',
        name: 'Dev Phase',
        designDays: 0,
        frontendDays: 20,
        backendDays: 0,
        designPerformers: [],
        developmentPerformers: ['Frontend Developer'],
        isEnabled: true,
      };

      const quote = calculateQuote(mockRates, [devOnlyModule], undefined, 0, 10);

      // No design work, so overlap doesn't affect timeline
      // Timeline: 0 + 20 - min(10, 0, 20) = 0 + 20 - 0 = 20 days
      expect(quote.totalDays).toBe(20);
    });

    it('should handle fractional days in calculations', () => {
      const module: ProjectModule = {
        id: 'fractional',
        name: 'Small Task',
        designDays: 1,
        frontendDays: 1,
        backendDays: 1,
        designPerformers: ['UI Designer'],
        developmentPerformers: ['Frontend Developer'],
        isEnabled: true,
      };

      const quote = calculateQuote(mockRates, [module]);

      // Design: 1 day * $200 = $200
      // Frontend: 1 day * $250 = $250
      // Total: $450
      expect(quote.totalQuote).toBe(450);
      expect(quote.totalDays).toBe(1);
    });
  });

  describe('Per-performer discounts', () => {
    it('should apply per-performer discount to single performer', () => {
      // UI Designer gets 20% discount
      const ratesWithDiscount: RateConfig[] = [
        { role: 'UI Designer', monthlyRate: 4000, discount: 20 },
        { role: 'Frontend Developer', monthlyRate: 5000 },
        { role: 'Backend Developer', monthlyRate: 5000 },
      ];

      const module: ProjectModule = {
        id: 'test',
        name: 'Test Module',
        designDays: 10,
        frontendDays: 0,
        backendDays: 0,
        designPerformers: ['UI Designer'],
        developmentPerformers: [],
        isEnabled: true,
      };

      const quote = calculateQuote(ratesWithDiscount, [module]);

      // UI Designer: $4000/month = $200/day
      // With 20% discount: $200 * 0.8 = $160/day
      // Total: 10 days * $160 = $1600
      expect(quote.designCost).toBe(1600);
      expect(quote.totalQuote).toBe(1600);
    });

    it('should apply different discounts to multiple performers', () => {
      // UI Designer: 20% discount
      // Frontend Developer: 10% discount
      // Backend Developer: no discount
      const ratesWithDiscounts: RateConfig[] = [
        { role: 'UI Designer', monthlyRate: 4000, discount: 20 },
        { role: 'Frontend Developer', monthlyRate: 5000, discount: 10 },
        { role: 'Backend Developer', monthlyRate: 5000 },
      ];

      const module: ProjectModule = {
        id: 'test',
        name: 'Test Module',
        designDays: 5,
        frontendDays: 10,
        backendDays: 10,
        designPerformers: ['UI Designer'],
        developmentPerformers: ['Frontend Developer', 'Backend Developer'],
        isEnabled: true,
      };

      const quote = calculateQuote(ratesWithDiscounts, [module]);

      // Design: UI Designer 5 days * $160/day (20% off) = $800
      // Development (MAX(10, 10) = 10 days):
      //   Frontend: 10 days * $225/day (10% off) = $2250
      //   Backend: 10 days * $250/day (no discount) = $2500
      // Total: $800 + $2250 + $2500 = $5550
      expect(quote.designCost).toBe(800);
      expect(quote.developmentCost).toBe(4750);
      expect(quote.totalQuote).toBe(5550);
    });

    it('should combine per-performer discount with project discount', () => {
      const ratesWithDiscount: RateConfig[] = [
        { role: 'UI Designer', monthlyRate: 4000, discount: 20 },
        { role: 'Frontend Developer', monthlyRate: 5000 },
      ];

      const module: ProjectModule = {
        id: 'test',
        name: 'Test Module',
        designDays: 10,
        frontendDays: 10,
        backendDays: 0,
        designPerformers: ['UI Designer'],
        developmentPerformers: ['Frontend Developer'],
        isEnabled: true,
      };

      const projectDiscount = 10; // 10% project-level discount
      const quote = calculateQuote(ratesWithDiscount, [module], undefined, projectDiscount);

      // Design: 10 days * $160/day (20% off) = $1600
      // Development: 10 days * $250/day = $2500
      // Subtotal after per-performer discount: $4100
      // Project discount: $4100 * 10% = $410
      // Final: $4100 - $410 = $3690
      expect(quote.totalQuote).toBe(4100);
      expect(quote.discountAmount).toBe(410);
      expect(quote.finalTotal).toBe(3690);
    });

    it('should handle 0% per-performer discount (no effect)', () => {
      const ratesWithZeroDiscount: RateConfig[] = [
        { role: 'UI Designer', monthlyRate: 4000, discount: 0 },
      ];

      const module: ProjectModule = {
        id: 'test',
        name: 'Test Module',
        designDays: 10,
        frontendDays: 0,
        backendDays: 0,
        designPerformers: ['UI Designer'],
        developmentPerformers: [],
        isEnabled: true,
      };

      const quote = calculateQuote(ratesWithZeroDiscount, [module]);

      // 0% discount = full price
      // 10 days * $200/day = $2000
      expect(quote.totalQuote).toBe(2000);
    });

    it('should handle 100% per-performer discount (free)', () => {
      const ratesWithFullDiscount: RateConfig[] = [
        { role: 'UI Designer', monthlyRate: 4000, discount: 100 },
      ];

      const module: ProjectModule = {
        id: 'test',
        name: 'Test Module',
        designDays: 10,
        frontendDays: 0,
        backendDays: 0,
        designPerformers: ['UI Designer'],
        developmentPerformers: [],
        isEnabled: true,
      };

      const quote = calculateQuote(ratesWithFullDiscount, [module]);

      // 100% discount = free
      expect(quote.totalQuote).toBe(0);
      expect(quote.designCost).toBe(0);
    });

    it('should apply per-performer discount to both design and development costs', () => {
      // Same performer appears in both design and development
      const ratesWithDiscount: RateConfig[] = [
        { role: 'Full Stack Developer', monthlyRate: 6000, discount: 25 },
      ];

      const module: ProjectModule = {
        id: 'test',
        name: 'Test Module',
        designDays: 4,
        frontendDays: 8,
        backendDays: 0,
        designPerformers: ['Full Stack Developer'],
        developmentPerformers: ['Full Stack Developer'],
        isEnabled: true,
      };

      const quote = calculateQuote(ratesWithDiscount, [module]);

      // Full Stack: $6000/month = $300/day
      // With 25% discount: $300 * 0.75 = $225/day
      // Design: 4 days * $225 = $900
      // Development: 8 days * $225 = $1800
      // Total: $900 + $1800 = $2700
      expect(quote.designCost).toBe(900);
      expect(quote.developmentCost).toBe(1800);
      expect(quote.totalQuote).toBe(2700);
    });

    it('should apply per-performer discount in module price calculation', () => {
      const ratesWithDiscount: RateConfig[] = [
        { role: 'UI Designer', monthlyRate: 4000, discount: 50 },
        { role: 'Frontend Developer', monthlyRate: 5000, discount: 20 },
      ];

      const module: ProjectModule = {
        id: 'test',
        name: 'Test Module',
        designDays: 10,
        frontendDays: 20,
        backendDays: 0,
        designPerformers: ['UI Designer'],
        developmentPerformers: ['Frontend Developer'],
        isEnabled: true,
      };

      const price = calculateModulePrice(module, ratesWithDiscount);

      // Design: 10 days * $100/day (50% off $200) = $1000
      // Development: 20 days * $200/day (20% off $250) = $4000
      // Total: $1000 + $4000 = $5000
      expect(price).toBe(5000);
    });

    it('should handle missing discount field (treated as 0%)', () => {
      // No discount field = no discount
      const ratesWithoutDiscountField: RateConfig[] = [
        { role: 'UI Designer', monthlyRate: 4000 }, // No discount field
      ];

      const module: ProjectModule = {
        id: 'test',
        name: 'Test Module',
        designDays: 10,
        frontendDays: 0,
        backendDays: 0,
        designPerformers: ['UI Designer'],
        developmentPerformers: [],
        isEnabled: true,
      };

      const quote = calculateQuote(ratesWithoutDiscountField, [module]);

      // No discount = full price
      // 10 days * $200/day = $2000
      expect(quote.totalQuote).toBe(2000);
    });

    it('should apply per-performer discount across multiple modules', () => {
      const ratesWithDiscount: RateConfig[] = [
        { role: 'UI Designer', monthlyRate: 4000, discount: 25 },
        { role: 'Frontend Developer', monthlyRate: 5000, discount: 10 },
      ];

      const modules: ProjectModule[] = [
        {
          id: 'module-1',
          name: 'Module 1',
          designDays: 5,
          frontendDays: 10,
          backendDays: 0,
          designPerformers: ['UI Designer'],
          developmentPerformers: ['Frontend Developer'],
          isEnabled: true,
        },
        {
          id: 'module-2',
          name: 'Module 2',
          designDays: 5,
          frontendDays: 10,
          backendDays: 0,
          designPerformers: ['UI Designer'],
          developmentPerformers: ['Frontend Developer'],
          isEnabled: true,
        },
      ];

      const quote = calculateQuote(ratesWithDiscount, modules);

      // Module 1:
      //   Design: 5 days * $150/day (25% off) = $750
      //   Dev: 10 days * $225/day (10% off) = $2250
      // Module 2:
      //   Design: 5 days * $150/day = $750
      //   Dev: 10 days * $225/day = $2250
      // Total design: $1500, Total dev: $4500
      // Grand total: $6000
      expect(quote.designCost).toBe(1500);
      expect(quote.developmentCost).toBe(4500);
      expect(quote.totalQuote).toBe(6000);
    });
  });
});
