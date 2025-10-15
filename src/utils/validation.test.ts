import { describe, it, expect } from 'vitest';
import {
  ValidationError,
  isRateConfig,
  isRateConfigArray,
  validateRateConfig,
  validateRateConfigs,
  isProjectModule,
  validateProjectModule,
  validateCSVRow,
  csvRowToModule,
  validateDiscount,
  validateTimeline,
} from './validation';

describe('validation', () => {
  describe('ValidationError', () => {
    it('should create ValidationError with correct name', () => {
      const error = new ValidationError('Test error');
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('ValidationError');
      expect(error.message).toBe('Test error');
    });
  });

  describe('isRateConfig', () => {
    it('should return true for valid RateConfig', () => {
      const valid = { role: 'Developer', monthlyRate: 5000 };
      expect(isRateConfig(valid)).toBe(true);
    });

    it('should return false for null', () => {
      expect(isRateConfig(null)).toBe(false);
    });

    it('should return false for missing role', () => {
      const invalid = { monthlyRate: 5000 };
      expect(isRateConfig(invalid)).toBe(false);
    });

    it('should return false for missing monthlyRate', () => {
      const invalid = { role: 'Developer' };
      expect(isRateConfig(invalid)).toBe(false);
    });

    it('should return false for negative rate', () => {
      const invalid = { role: 'Developer', monthlyRate: -100 };
      expect(isRateConfig(invalid)).toBe(false);
    });

    it('should return false for string rate', () => {
      const invalid = { role: 'Developer', monthlyRate: '5000' };
      expect(isRateConfig(invalid)).toBe(false);
    });
  });

  describe('isRateConfigArray', () => {
    it('should return true for valid array', () => {
      const valid = [
        { role: 'Dev1', monthlyRate: 5000 },
        { role: 'Dev2', monthlyRate: 6000 },
      ];
      expect(isRateConfigArray(valid)).toBe(true);
    });

    it('should return false for non-array', () => {
      expect(isRateConfigArray({ role: 'Dev', monthlyRate: 5000 })).toBe(false);
    });

    it('should return false for array with invalid item', () => {
      const invalid = [
        { role: 'Dev1', monthlyRate: 5000 },
        { role: 'Dev2' }, // Missing monthlyRate
      ];
      expect(isRateConfigArray(invalid)).toBe(false);
    });
  });

  describe('validateRateConfig', () => {
    it('should validate correct config', () => {
      const config = { role: 'Developer', monthlyRate: 5000 };
      expect(validateRateConfig(config)).toEqual(config);
    });

    it('should throw for invalid config', () => {
      expect(() => validateRateConfig({ role: 'Dev' })).toThrow(ValidationError);
    });

    it('should throw for rate too high', () => {
      const config = { role: 'Developer', monthlyRate: 2000000 };
      expect(() => validateRateConfig(config)).toThrow('must be between 0 and 1,000,000');
    });

    it('should throw for empty role name', () => {
      const config = { role: '   ', monthlyRate: 5000 };
      expect(() => validateRateConfig(config)).toThrow('Role name cannot be empty');
    });
  });

  describe('validateRateConfigs', () => {
    it('should validate array of configs', () => {
      const configs = [
        { role: 'Dev1', monthlyRate: 5000 },
        { role: 'Dev2', monthlyRate: 6000 },
      ];
      expect(validateRateConfigs(configs)).toEqual(configs);
    });

    it('should throw for non-array', () => {
      expect(() => validateRateConfigs('not an array')).toThrow('must be an array');
    });

    it('should throw with index for invalid item', () => {
      const configs = [
        { role: 'Dev1', monthlyRate: 5000 },
        { role: 'Dev2', monthlyRate: -100 },
      ];
      expect(() => validateRateConfigs(configs)).toThrow('at index 1');
    });
  });

  describe('isProjectModule', () => {
    it('should return true for valid module', () => {
      const valid = {
        id: 'mod-1',
        name: 'Feature',
        frontendDays: 5,
        backendDays: 10,
        performers: ['Dev1', 'Dev2'],
        isEnabled: true,
      };
      expect(isProjectModule(valid)).toBe(true);
    });

    it('should return false for missing fields', () => {
      const invalid = {
        id: 'mod-1',
        name: 'Feature',
        frontendDays: 5,
        // Missing other fields
      };
      expect(isProjectModule(invalid)).toBe(false);
    });

    it('should return false for invalid performers', () => {
      const invalid = {
        id: 'mod-1',
        name: 'Feature',
        frontendDays: 5,
        backendDays: 10,
        performers: 'Dev1,Dev2', // Should be array
        isEnabled: true,
      };
      expect(isProjectModule(invalid)).toBe(false);
    });
  });

  describe('validateProjectModule', () => {
    it('should validate correct module', () => {
      const module = {
        id: 'mod-1',
        name: 'Feature',
        frontendDays: 5,
        backendDays: 10,
        performers: ['Dev1'],
        isEnabled: true,
      };
      expect(validateProjectModule(module)).toEqual(module);
    });

    it('should throw for negative frontend days', () => {
      const module = {
        id: 'mod-1',
        name: 'Feature',
        frontendDays: -5,
        backendDays: 10,
        performers: [],
        isEnabled: true,
      };
      expect(() => validateProjectModule(module)).toThrow('Frontend days must be between');
    });

    it('should throw for backend days too high', () => {
      const module = {
        id: 'mod-1',
        name: 'Feature',
        frontendDays: 5,
        backendDays: 2000,
        performers: [],
        isEnabled: true,
      };
      expect(() => validateProjectModule(module)).toThrow('Backend days must be between');
    });

    it('should throw for empty module name', () => {
      const module = {
        id: 'mod-1',
        name: '   ',
        frontendDays: 5,
        backendDays: 10,
        performers: [],
        isEnabled: true,
      };
      expect(() => validateProjectModule(module)).toThrow('Module name cannot be empty');
    });
  });

  describe('validateCSVRow', () => {
    it('should validate correct CSV row', () => {
      const row = {
        Module: 'Feature',
        'Front-end': '5',
        'Back-end': '10',
        Performer: 'Dev1,Dev2',
      };
      expect(validateCSVRow(row, 0)).toEqual(row);
    });

    it('should throw for missing Module field', () => {
      const row = {
        'Front-end': '5',
        'Back-end': '10',
        Performer: 'Dev1',
      };
      expect(() => validateCSVRow(row, 0)).toThrow("Row 1: Missing or invalid 'Module'");
    });

    it('should throw for invalid Front-end field', () => {
      const row = {
        Module: 'Feature',
        'Front-end': null,
        'Back-end': '10',
        Performer: 'Dev1',
      };
      expect(() => validateCSVRow(row, 2)).toThrow("Row 3: Missing or invalid 'Front-end'");
    });

    it('should accept numeric values', () => {
      const row = {
        Module: 'Feature',
        'Front-end': 5 as string | number,
        'Back-end': 10 as string | number,
        Performer: 'Dev1',
      };
      expect(validateCSVRow(row, 0)).toEqual(row);
    });
  });

  describe('csvRowToModule', () => {
    it('should convert valid CSV row to module', () => {
      const row = {
        Module: 'Authentication',
        'Front-end': '5',
        'Back-end': '10',
        Performer: 'Dev1, Dev2',
      };
      const module = csvRowToModule(row, 0);

      expect(module).toEqual({
        id: 'module-0',
        name: 'Authentication',
        frontendDays: 5,
        backendDays: 10,
        performers: ['Dev1', 'Dev2'],
        isEnabled: true,
      });
    });

    it('should handle numeric values', () => {
      const row = {
        Module: 'Feature',
        'Front-end': '7.5',
        'Back-end': '12.25',
        Performer: 'Dev1',
      };
      const module = csvRowToModule(row, 1);

      expect(module.frontendDays).toBe(7.5);
      expect(module.backendDays).toBe(12.25);
      expect(module.id).toBe('module-1');
    });

    it('should throw for invalid frontend days', () => {
      const row = {
        Module: 'Feature',
        'Front-end': 'invalid',
        'Back-end': '10',
        Performer: 'Dev1',
      };
      expect(() => csvRowToModule(row, 0)).toThrow('Frontend days must be a positive number');
    });

    it('should throw for negative backend days', () => {
      const row = {
        Module: 'Feature',
        'Front-end': '5',
        'Back-end': '-10',
        Performer: 'Dev1',
      };
      expect(() => csvRowToModule(row, 0)).toThrow('Backend days must be a positive number');
    });

    it('should trim whitespace from module name and performers', () => {
      const row = {
        Module: '  Authentication  ',
        'Front-end': '5',
        'Back-end': '10',
        Performer: ' Dev1 , Dev2 ',
      };
      const module = csvRowToModule(row, 0);

      expect(module.name).toBe('Authentication');
      expect(module.performers).toEqual(['Dev1', 'Dev2']);
    });

    it('should handle empty performers', () => {
      const row = {
        Module: 'Feature',
        'Front-end': '5',
        'Back-end': '10',
        Performer: '',
      };
      const module = csvRowToModule(row, 0);

      expect(module.performers).toEqual([]);
    });
  });

  describe('validateDiscount', () => {
    it('should validate correct discount', () => {
      expect(validateDiscount(10)).toBe(10);
      expect(validateDiscount(0)).toBe(0);
      expect(validateDiscount(100)).toBe(100);
    });

    it('should throw for negative discount', () => {
      expect(() => validateDiscount(-5)).toThrow('Discount must be between 0 and 100');
    });

    it('should throw for discount over 100', () => {
      expect(() => validateDiscount(150)).toThrow('Discount must be between 0 and 100');
    });

    it('should throw for non-number', () => {
      expect(() => validateDiscount('10' as any)).toThrow('Discount must be a number');
    });

    it('should throw for NaN', () => {
      expect(() => validateDiscount(NaN)).toThrow('Discount must be a number');
    });
  });

  describe('validateTimeline', () => {
    it('should validate correct timeline', () => {
      expect(validateTimeline(15, 10, 30)).toBe(15);
    });

    it('should round decimal values', () => {
      expect(validateTimeline(15.7, 10, 30)).toBe(16);
    });

    it('should throw for timeline below min', () => {
      expect(() => validateTimeline(5, 10, 30)).toThrow('Timeline must be between 10 and 30');
    });

    it('should throw for timeline above max', () => {
      expect(() => validateTimeline(40, 10, 30)).toThrow('Timeline must be between 10 and 30');
    });

    it('should throw for non-number', () => {
      expect(() => validateTimeline('15' as any, 10, 30)).toThrow('Timeline must be a number');
    });

    it('should accept min and max boundaries', () => {
      expect(validateTimeline(10, 10, 30)).toBe(10);
      expect(validateTimeline(30, 10, 30)).toBe(30);
    });
  });
});
