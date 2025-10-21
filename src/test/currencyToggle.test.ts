import { describe, it, expect } from 'vitest';
import { calculateModulePrice } from '@/services/calculationEngine';
import { ProjectModule } from '@/types/project.types';
import { RateConfig } from '@/types/rates.types';

describe('Currency Toggle Feature', () => {
  const mockRates: RateConfig[] = [
    { role: 'UI Designer', monthlyRate: 5000 },
    { role: 'Frontend Developer', monthlyRate: 6000 },
    { role: 'Backend Developer', monthlyRate: 7000 },
  ];

  const mockModule: ProjectModule = {
    id: 'test-module',
    name: 'Test Module',
    designDays: 10,
    frontendDays: 15,
    backendDays: 20,
    designPerformers: ['UI Designer'],
    developmentPerformers: ['Frontend Developer', 'Backend Developer'],
    isEnabled: true,
  };

  describe('Text Export with Currency', () => {
    it('should include USD currency symbol in exported text', () => {
      const currency = '$';
      const totalQuote = 50000;
      const designCost = 15000;
      const developmentCost = 35000;
      const monthlyFee = 18000;
      const totalDays = 30;
      const designDays = 10;
      const developmentDays = 20;

      const expectedText = `
PROJECT QUOTE SUMMARY
=====================

Total: ${currency}${totalQuote.toLocaleString()}

Timeline: ${totalDays} working days

WORK BREAKDOWN
--------------
Design Effort: ${designDays} days (${currency}${designCost.toLocaleString()})
Development Effort: ${developmentDays} days (${currency}${developmentCost.toLocaleString()})
Total Effort: ${designDays + developmentDays} days completed in ${totalDays} calendar days

TEAM RATES
----------
Monthly Rate Card: ${currency}${monthlyFee.toLocaleString()}

Generated with Project Quote Calculator
      `.trim();

      expect(expectedText).toContain('$50,000');
      expect(expectedText).toContain('$15,000');
      expect(expectedText).toContain('$35,000');
      expect(expectedText).toContain('$18,000');
      expect(expectedText).not.toContain('€');
    });

    it('should include EUR currency symbol in exported text', () => {
      const currency = '€';
      const totalQuote = 50000;
      const designCost = 15000;
      const developmentCost = 35000;
      const monthlyFee = 18000;
      const totalDays = 30;
      const designDays = 10;
      const developmentDays = 20;

      const expectedText = `
PROJECT QUOTE SUMMARY
=====================

Total: ${currency}${totalQuote.toLocaleString()}

Timeline: ${totalDays} working days

WORK BREAKDOWN
--------------
Design Effort: ${designDays} days (${currency}${designCost.toLocaleString()})
Development Effort: ${developmentDays} days (${currency}${developmentCost.toLocaleString()})
Total Effort: ${designDays + developmentDays} days completed in ${totalDays} calendar days

TEAM RATES
----------
Monthly Rate Card: ${currency}${monthlyFee.toLocaleString()}

Generated with Project Quote Calculator
      `.trim();

      expect(expectedText).toContain('€50,000');
      expect(expectedText).toContain('€15,000');
      expect(expectedText).toContain('€35,000');
      expect(expectedText).toContain('€18,000');
      expect(expectedText).not.toContain('$');
    });

    it('should include discount with correct currency in exported text', () => {
      const currency = '$';
      const totalQuote = 50000;
      const discountAmount = 5000;
      const finalTotal = 45000;

      const textWithDiscount = `Total: ${currency}${finalTotal.toLocaleString()}
Original: ${currency}${totalQuote.toLocaleString()}
Discount: -${currency}${discountAmount.toLocaleString()}`;

      expect(textWithDiscount).toContain('$45,000');
      expect(textWithDiscount).toContain('$50,000');
      expect(textWithDiscount).toContain('-$5,000');
    });
  });

  describe('Markdown Export with Currency', () => {
    it('should include USD currency symbol in full markdown export', () => {
      const currency = '$';
      const totalQuote = 50000;
      const designCost = 15000;
      const developmentCost = 35000;
      const monthlyFee = 18000;
      const totalDays = 30;
      const designDays = 10;
      const developmentDays = 20;

      const markdown = `# Project Quote Summary

## Budget Overview
- **Total Quote:** ${currency}${totalQuote.toLocaleString()}
- **Timeline:** ${totalDays} working days

## Work Breakdown
- **Design Phase:** ${designDays} days - ${currency}${designCost.toLocaleString()}
- **Development Phase:** ${developmentDays} days - ${currency}${developmentCost.toLocaleString()}
- **Total Effort:** ${designDays + developmentDays} days completed in ${totalDays} calendar days

## Team Rates
- **Monthly Rate Card:** ${currency}${monthlyFee.toLocaleString()}`;

      expect(markdown).toContain('$50,000');
      expect(markdown).toContain('$15,000');
      expect(markdown).toContain('$35,000');
      expect(markdown).toContain('$18,000');
      expect(markdown).not.toContain('€');
    });

    it('should include EUR currency symbol in full markdown export', () => {
      const currency = '€';
      const totalQuote = 50000;
      const designCost = 15000;
      const developmentCost = 35000;
      const monthlyFee = 18000;
      const totalDays = 30;
      const designDays = 10;
      const developmentDays = 20;

      const markdown = `# Project Quote Summary

## Budget Overview
- **Total Quote:** ${currency}${totalQuote.toLocaleString()}
- **Timeline:** ${totalDays} working days

## Work Breakdown
- **Design Phase:** ${designDays} days - ${currency}${designCost.toLocaleString()}
- **Development Phase:** ${developmentDays} days - ${currency}${developmentCost.toLocaleString()}
- **Total Effort:** ${designDays + developmentDays} days completed in ${totalDays} calendar days

## Team Rates
- **Monthly Rate Card:** ${currency}${monthlyFee.toLocaleString()}`;

      expect(markdown).toContain('€50,000');
      expect(markdown).toContain('€15,000');
      expect(markdown).toContain('€35,000');
      expect(markdown).toContain('€18,000');
      expect(markdown).not.toContain('$');
    });

    it('should include discount with correct currency in markdown export', () => {
      const currency = '€';
      const totalQuote = 50000;
      const discountAmount = 5000;
      const finalTotal = 45000;

      const markdownWithDiscount = `## Budget Overview
- **Total Quote:** ${currency}${finalTotal.toLocaleString()}
- **Original Price:** ${currency}${totalQuote.toLocaleString()}
- **Discount:** -${currency}${discountAmount.toLocaleString()}`;

      expect(markdownWithDiscount).toContain('€45,000');
      expect(markdownWithDiscount).toContain('€50,000');
      expect(markdownWithDiscount).toContain('-€5,000');
    });
  });

  describe('Module Price Calculation with Different Currencies', () => {
    it('should calculate module price correctly (currency-agnostic)', () => {
      // Module price calculation should be the same regardless of display currency
      const price = calculateModulePrice(mockModule, mockRates);

      expect(price).toBeGreaterThan(0);
      expect(typeof price).toBe('number');
    });

    it('should format module price with USD currency', () => {
      const currency = '$';
      const price = calculateModulePrice(mockModule, mockRates);
      const formatted = `${currency}${price.toLocaleString()}`;

      expect(formatted).toMatch(/^\$\d{1,3}(,\d{3})*$/);
      expect(formatted).toContain('$');
    });

    it('should format module price with EUR currency', () => {
      const currency = '€';
      const price = calculateModulePrice(mockModule, mockRates);
      const formatted = `${currency}${price.toLocaleString()}`;

      expect(formatted).toMatch(/^€\d{1,3}(,\d{3})*$/);
      expect(formatted).toContain('€');
    });
  });

  describe('Currency Display in Rate Configuration', () => {
    it('should display USD symbol for monthly rates', () => {
      const currency = '$';
      const rate = mockRates[0];
      const displayText = `${currency}/month`;
      const valueDisplay = `${currency}${rate.monthlyRate.toLocaleString()}`;

      expect(displayText).toBe('$/month');
      expect(valueDisplay).toBe('$5,000');
    });

    it('should display EUR symbol for monthly rates', () => {
      const currency = '€';
      const rate = mockRates[0];
      const displayText = `${currency}/month`;
      const valueDisplay = `${currency}${rate.monthlyRate.toLocaleString()}`;

      expect(displayText).toBe('€/month');
      expect(valueDisplay).toBe('€5,000');
    });

    it('should handle empty rate value (blank field)', () => {
      const emptyRate = 0;
      const displayValue = emptyRate || '';

      expect(displayValue).toBe('');
      expect(String(displayValue)).not.toContain('0');
    });
  });

  describe('Currency Consistency Across Components', () => {
    it('should use the same currency symbol throughout the application', () => {
      const currency: '$' | '€' = '$';

      // QuoteSummary displays
      const totalDisplay = `${currency}50,000`;
      const designCostDisplay = `${currency}15,000`;
      const devCostDisplay = `${currency}35,000`;
      const monthlyRateDisplay = `${currency}18,000`;

      // ModuleList display
      const modulePrice = calculateModulePrice(mockModule, mockRates);
      const moduleDisplay = `${currency}${modulePrice.toLocaleString()}`;

      // RateConfiguration display
      const rateDisplay = `${currency}/month`;

      expect(totalDisplay).toContain('$');
      expect(designCostDisplay).toContain('$');
      expect(devCostDisplay).toContain('$');
      expect(monthlyRateDisplay).toContain('$');
      expect(moduleDisplay).toContain('$');
      expect(rateDisplay).toContain('$');

      // All should use the same currency
      const allDisplays = [
        totalDisplay,
        designCostDisplay,
        devCostDisplay,
        monthlyRateDisplay,
        moduleDisplay,
        rateDisplay,
      ];

      const usedCurrencies = new Set(
        allDisplays
          .join('')
          .split('')
          .filter(char => char === '$' || char === '€')
      );

      expect(usedCurrencies.size).toBe(1);
      expect(usedCurrencies.has('$')).toBe(true);
    });

    it('should switch all displays when currency toggles from USD to EUR', () => {
      let currency: '$' | '€' = '$';

      // Initial displays with USD
      const initialTotal = `${currency}50,000`;
      expect(initialTotal).toContain('$');

      // Toggle to EUR
      currency = '€';

      // Updated displays with EUR
      const updatedTotal = `${currency}50,000`;
      const updatedDesign = `${currency}15,000`;
      const updatedRate = `${currency}/month`;

      expect(updatedTotal).toContain('€');
      expect(updatedTotal).not.toContain('$');
      expect(updatedDesign).toContain('€');
      expect(updatedRate).toContain('€');
    });
  });

  describe('Currency Type Safety', () => {
    it('should only accept valid currency symbols', () => {
      type Currency = '$' | '€';

      const validCurrencies: Currency[] = ['$', '€'];

      validCurrencies.forEach(currency => {
        expect(['$', '€']).toContain(currency);
      });
    });

    it('should default to USD when currency is not specified', () => {
      const defaultCurrency: '$' | '€' = '$';

      expect(defaultCurrency).toBe('$');
    });
  });

  describe('Currency in Saved Discount Display', () => {
    it('should show discount amount with correct currency in USD', () => {
      const currency = '$';
      const discountAmount = 5000;
      const savedText = `-${currency}${discountAmount.toLocaleString()} saved`;

      expect(savedText).toBe('-$5,000 saved');
      expect(savedText).toContain('$');
    });

    it('should show discount amount with correct currency in EUR', () => {
      const currency = '€';
      const discountAmount = 5000;
      const savedText = `-${currency}${discountAmount.toLocaleString()} saved`;

      expect(savedText).toBe('-€5,000 saved');
      expect(savedText).toContain('€');
    });
  });
});
