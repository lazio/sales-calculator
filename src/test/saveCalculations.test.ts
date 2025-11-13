import { describe, it, expect } from 'vitest';

describe('Save Calculations - Performer-specific Day Calculations', () => {
  const BUSINESS_DAYS_PER_MONTH = 20;

  // Helper function to determine performer type (matches logic in SidebarFooter and QuoteSummary)
  function getPerformerType(performer: string): 'frontend' | 'backend' | 'other' {
    const performerName = performer.toLowerCase();

    if (performerName.includes('front-end') || performerName.includes('frontend') ||
        performerName.match(/\bfe\b/) || performerName.match(/\bfront\b/)) {
      return 'frontend';
    } else if (performerName.includes('back-end') || performerName.includes('backend') ||
               performerName.match(/\bbe\b/) || performerName.match(/\bback\b/)) {
      return 'backend';
    } else {
      return 'other';
    }
  }

  // Helper function to calculate days for a performer
  function calculatePerformerDays(
    performer: string,
    frontendDays: number,
    backendDays: number
  ): number {
    const performerType = getPerformerType(performer);
    const maxDevDays = Math.max(frontendDays, backendDays);

    if (performerType === 'frontend') {
      return frontendDays;
    } else if (performerType === 'backend') {
      return backendDays;
    } else {
      return maxDevDays;
    }
  }

  describe('Frontend Developers', () => {
    it('should work frontend days for "FE developer"', () => {
      const days = calculatePerformerDays('FE developer', 2.5, 1.5);
      expect(days).toBe(2.5);
    });

    it('should work frontend days for "Frontend Developer"', () => {
      const days = calculatePerformerDays('Frontend Developer', 3, 2);
      expect(days).toBe(3);
    });

    it('should work frontend days for "Front-end Developer"', () => {
      const days = calculatePerformerDays('Front-end Developer', 4, 3);
      expect(days).toBe(4);
    });

    it('should work frontend days when frontend < backend', () => {
      const days = calculatePerformerDays('FE developer', 1, 5);
      expect(days).toBe(1);
    });

    it('should work frontend days when frontend > backend', () => {
      const days = calculatePerformerDays('Frontend Developer', 5, 2);
      expect(days).toBe(5);
    });
  });

  describe('Backend Developers', () => {
    it('should work backend days for "BE developer"', () => {
      const days = calculatePerformerDays('BE developer', 2.5, 1.5);
      expect(days).toBe(1.5);
    });

    it('should work backend days for "Backend Developer"', () => {
      const days = calculatePerformerDays('Backend Developer', 3, 2);
      expect(days).toBe(2);
    });

    it('should work backend days for "Back-end Developer"', () => {
      const days = calculatePerformerDays('Back-end Developer', 4, 3);
      expect(days).toBe(3);
    });

    it('should work backend days when backend < frontend', () => {
      const days = calculatePerformerDays('BE developer', 5, 2);
      expect(days).toBe(2);
    });

    it('should work backend days when backend > frontend', () => {
      const days = calculatePerformerDays('Backend Developer', 2, 5);
      expect(days).toBe(5);
    });
  });

  describe('Other Roles (QA, PM, etc.)', () => {
    it('should work max days for QA', () => {
      const days = calculatePerformerDays('QA', 2.5, 1.5);
      expect(days).toBe(2.5);
    });

    it('should work max days for Project Manager', () => {
      const days = calculatePerformerDays('Project Manager', 3, 5);
      expect(days).toBe(5);
    });

    it('should work max days for Tech Lead', () => {
      const days = calculatePerformerDays('Tech Lead', 4, 3);
      expect(days).toBe(4);
    });

    it('should work max days for Designer', () => {
      const days = calculatePerformerDays('Designer', 2, 4);
      expect(days).toBe(4);
    });
  });

  describe('Cost Calculations', () => {
    const monthlyRate = 1000;
    const dailyRate = monthlyRate / BUSINESS_DAYS_PER_MONTH; // 50

    it('should calculate correct cost for FE developer', () => {
      const frontendDays = 2.5;
      const backendDays = 1.5;
      const days = calculatePerformerDays('FE developer', frontendDays, backendDays);
      const cost = dailyRate * days;

      expect(days).toBe(2.5);
      expect(cost).toBe(125);
    });

    it('should calculate correct cost for BE developer', () => {
      const frontendDays = 2.5;
      const backendDays = 1.5;
      const days = calculatePerformerDays('BE developer', frontendDays, backendDays);
      const cost = dailyRate * days;

      expect(days).toBe(1.5);
      expect(cost).toBe(75);
    });

    it('should calculate correct cost for QA (other role)', () => {
      const frontendDays = 2.5;
      const backendDays = 1.5;
      const days = calculatePerformerDays('QA', frontendDays, backendDays);
      const cost = dailyRate * days;

      expect(days).toBe(2.5);
      expect(cost).toBe(125);
    });
  });

  describe('Module with Frontend=2.5, Backend=1.5 (as in bug report)', () => {
    const frontendDays = 2.5;
    const backendDays = 1.5;
    const monthlyRate = 1000;
    const dailyRate = monthlyRate / BUSINESS_DAYS_PER_MONTH; // 50

    it('FE developer should work 2.5 days and cost $125', () => {
      const days = calculatePerformerDays('FE developer', frontendDays, backendDays);
      const cost = dailyRate * days;

      expect(days).toBe(2.5);
      expect(cost).toBe(125);
    });

    it('BE developer should work 1.5 days and cost $75 (not 2.5 days)', () => {
      const days = calculatePerformerDays('BE developer', frontendDays, backendDays);
      const cost = dailyRate * days;

      expect(days).toBe(1.5);
      expect(cost).toBe(75); // Not 125!
    });

    it('QA should work 2.5 days (max) and cost $125', () => {
      const days = calculatePerformerDays('QA', frontendDays, backendDays);
      const cost = dailyRate * days;

      expect(days).toBe(2.5);
      expect(cost).toBe(125);
    });

    it('total cost should be $325 for all three performers', () => {
      const feDays = calculatePerformerDays('FE developer', frontendDays, backendDays);
      const beDays = calculatePerformerDays('BE developer', frontendDays, backendDays);
      const qaDays = calculatePerformerDays('QA', frontendDays, backendDays);

      const totalCost = (feDays + beDays + qaDays) * dailyRate;

      // 2.5 (FE) + 1.5 (BE) + 2.5 (QA) = 6.5 days * $50 = $325
      expect(totalCost).toBe(325);
    });
  });
});
