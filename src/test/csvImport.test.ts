import { describe, it, expect } from 'vitest';
import { validateCSVRow, csvRowToModule, ValidationError } from '@/utils/validation';
import { CSVRow } from '@/types/project.types';

describe('CSV Import Edge Cases', () => {
  describe('Wrong structure / Missing columns', () => {
    it('should reject CSV row with missing Module field', () => {
      const row = {
        'Design (days)': '5',
        'Front-end (days)': '8',
        'Back-end (days)': '10',
        'Design Performers': 'UI Designer',
        'Development Performers': 'Frontend Developer',
      };

      expect(() => validateCSVRow(row, 0)).toThrow(ValidationError);
      expect(() => validateCSVRow(row, 0)).toThrow("Missing or invalid 'Module' field");
    });

    it('should reject CSV row with missing Design (days) field', () => {
      const row = {
        Module: 'Authentication',
        'Front-end (days)': '8',
        'Back-end (days)': '10',
        'Design Performers': 'UI Designer',
        'Development Performers': 'Frontend Developer',
      };

      expect(() => validateCSVRow(row, 0)).toThrow(ValidationError);
      expect(() => validateCSVRow(row, 0)).toThrow("Missing or invalid 'Design (days)' field");
    });

    it('should reject CSV row with missing Front-end (days) field', () => {
      const row = {
        Module: 'Authentication',
        'Design (days)': '5',
        'Back-end (days)': '10',
        'Design Performers': 'UI Designer',
        'Development Performers': 'Frontend Developer',
      };

      expect(() => validateCSVRow(row, 0)).toThrow(ValidationError);
      expect(() => validateCSVRow(row, 0)).toThrow("Missing or invalid 'Front-end (days)' field");
    });

    it('should reject CSV row with missing Back-end (days) field', () => {
      const row = {
        Module: 'Authentication',
        'Design (days)': '5',
        'Front-end (days)': '8',
        'Design Performers': 'UI Designer',
        'Development Performers': 'Frontend Developer',
      };

      expect(() => validateCSVRow(row, 0)).toThrow(ValidationError);
      expect(() => validateCSVRow(row, 0)).toThrow("Missing or invalid 'Back-end (days)' field");
    });

    it('should reject CSV row with missing performer fields', () => {
      const row = {
        Module: 'Authentication',
        'Design (days)': '5',
        'Front-end (days)': '8',
        'Back-end (days)': '10',
      };

      expect(() => validateCSVRow(row, 0)).toThrow(ValidationError);
    });
  });

  describe('Design-only modules', () => {
    it('should accept module with only design work', () => {
      const validRow: CSVRow = {
        Module: 'Design System',
        'Design (days)': '20',
        'Front-end (days)': '0',
        'Back-end (days)': '0',
        'Design Performers': 'UI Designer, UX Designer',
        'Development Performers': '',
      };

      const validated = validateCSVRow(validRow, 0);
      expect(validated).toBeDefined();

      const module = csvRowToModule(validated, 0);
      expect(module.designDays).toBe(20);
      expect(module.frontendDays).toBe(0);
      expect(module.backendDays).toBe(0);
      expect(module.designPerformers).toEqual(['UI Designer', 'UX Designer']);
      expect(module.developmentPerformers).toEqual([]);
    });

    it('should handle multiple design-only modules', () => {
      const modules = [
        {
          Module: 'Wireframes',
          'Design (days)': '10',
          'Front-end (days)': '0',
          'Back-end (days)': '0',
          'Design Performers': 'UX Designer',
          'Development Performers': '',
        },
        {
          Module: 'Brand Guidelines',
          'Design (days)': '15',
          'Front-end (days)': '0',
          'Back-end (days)': '0',
          'Design Performers': 'UI Designer, Brand Strategist',
          'Development Performers': '',
        },
      ];

      modules.forEach((row, index) => {
        const validated = validateCSVRow(row, index);
        const module = csvRowToModule(validated, index);
        expect(module.designDays).toBeGreaterThan(0);
        expect(module.frontendDays).toBe(0);
        expect(module.backendDays).toBe(0);
      });
    });
  });

  describe('Development-only modules', () => {
    it('should accept module with only backend development', () => {
      const validRow: CSVRow = {
        Module: 'API Integration',
        'Design (days)': '0',
        'Front-end (days)': '0',
        'Back-end (days)': '20',
        'Design Performers': '',
        'Development Performers': 'Backend Developer, DevOps Engineer',
      };

      const validated = validateCSVRow(validRow, 0);
      const module = csvRowToModule(validated, 0);

      expect(module.designDays).toBe(0);
      expect(module.frontendDays).toBe(0);
      expect(module.backendDays).toBe(20);
      expect(module.designPerformers).toEqual([]);
      expect(module.developmentPerformers).toEqual(['Backend Developer', 'DevOps Engineer']);
    });

    it('should accept module with only frontend development', () => {
      const validRow: CSVRow = {
        Module: 'UI Polish',
        'Design (days)': '0',
        'Front-end (days)': '15',
        'Back-end (days)': '0',
        'Design Performers': '',
        'Development Performers': 'Frontend Developer',
      };

      const validated = validateCSVRow(validRow, 0);
      const module = csvRowToModule(validated, 0);

      expect(module.designDays).toBe(0);
      expect(module.frontendDays).toBe(15);
      expect(module.backendDays).toBe(0);
      expect(module.developmentPerformers).toEqual(['Frontend Developer']);
    });

    it('should accept module with mixed frontend and backend, no design', () => {
      const validRow: CSVRow = {
        Module: 'Code Refactoring',
        'Design (days)': '0',
        'Front-end (days)': '10',
        'Back-end (days)': '15',
        'Design Performers': '',
        'Development Performers': 'Frontend Developer, Backend Developer',
      };

      const validated = validateCSVRow(validRow, 0);
      const module = csvRowToModule(validated, 0);

      expect(module.designDays).toBe(0);
      expect(module.frontendDays).toBe(10);
      expect(module.backendDays).toBe(15);
    });
  });

  describe('Empty or no performers', () => {
    it('should accept module with empty performer fields when days are 0', () => {
      const validRow: CSVRow = {
        Module: 'Mystery Module',
        'Design (days)': '0',
        'Front-end (days)': '0',
        'Back-end (days)': '0',
        'Design Performers': '',
        'Development Performers': '',
      };

      const validated = validateCSVRow(validRow, 0);
      const module = csvRowToModule(validated, 0);

      expect(module.designPerformers).toEqual([]);
      expect(module.developmentPerformers).toEqual([]);
      expect(module.designDays).toBe(0);
      expect(module.frontendDays).toBe(0);
      expect(module.backendDays).toBe(0);
    });

    it('should trim whitespace from performer names', () => {
      const validRow: CSVRow = {
        Module: 'Test Module',
        'Design (days)': '5',
        'Front-end (days)': '8',
        'Back-end (days)': '10',
        'Design Performers': '  UI Designer  ,  UX Designer  ',
        'Development Performers': '  Frontend Dev  ,  Backend Dev  ',
      };

      const validated = validateCSVRow(validRow, 0);
      const module = csvRowToModule(validated, 0);

      expect(module.designPerformers).toEqual(['UI Designer', 'UX Designer']);
      expect(module.developmentPerformers).toEqual(['Frontend Dev', 'Backend Dev']);
    });

    it('should filter out empty performer names after split', () => {
      const validRow: CSVRow = {
        Module: 'Test Module',
        'Design (days)': '5',
        'Front-end (days)': '8',
        'Back-end (days)': '10',
        'Design Performers': 'UI Designer,,UX Designer,',
        'Development Performers': ',Frontend Dev,,Backend Dev,',
      };

      const validated = validateCSVRow(validRow, 0);
      const module = csvRowToModule(validated, 0);

      expect(module.designPerformers).toEqual(['UI Designer', 'UX Designer']);
      expect(module.developmentPerformers).toEqual(['Frontend Dev', 'Backend Dev']);
    });
  });

  describe('Invalid numeric data', () => {
    it('should reject negative design days', () => {
      const invalidRow: CSVRow = {
        Module: 'Invalid Module',
        'Design (days)': '-5',
        'Front-end (days)': '8',
        'Back-end (days)': '10',
        'Design Performers': 'UI Designer',
        'Development Performers': 'Frontend Developer',
      };

      const validated = validateCSVRow(invalidRow, 0);
      expect(() => csvRowToModule(validated, 0)).toThrow(ValidationError);
      expect(() => csvRowToModule(validated, 0)).toThrow('Design days must be a positive number');
    });

    it('should reject negative frontend days', () => {
      const invalidRow: CSVRow = {
        Module: 'Invalid Module',
        'Design (days)': '5',
        'Front-end (days)': '-8',
        'Back-end (days)': '10',
        'Design Performers': 'UI Designer',
        'Development Performers': 'Frontend Developer',
      };

      const validated = validateCSVRow(invalidRow, 0);
      expect(() => csvRowToModule(validated, 0)).toThrow(ValidationError);
      expect(() => csvRowToModule(validated, 0)).toThrow('Frontend days must be a positive number');
    });

    it('should reject negative backend days', () => {
      const invalidRow: CSVRow = {
        Module: 'Invalid Module',
        'Design (days)': '5',
        'Front-end (days)': '8',
        'Back-end (days)': '-10',
        'Design Performers': 'UI Designer',
        'Development Performers': 'Backend Developer',
      };

      const validated = validateCSVRow(invalidRow, 0);
      expect(() => csvRowToModule(validated, 0)).toThrow(ValidationError);
      expect(() => csvRowToModule(validated, 0)).toThrow('Backend days must be a positive number');
    });

    it('should reject text in design days field', () => {
      const invalidRow: CSVRow = {
        Module: 'Invalid Module',
        'Design (days)': 'seven',
        'Front-end (days)': '8',
        'Back-end (days)': '10',
        'Design Performers': 'UI Designer',
        'Development Performers': 'Frontend Developer',
      };

      const validated = validateCSVRow(invalidRow, 0);
      expect(() => csvRowToModule(validated, 0)).toThrow(ValidationError);
      expect(() => csvRowToModule(validated, 0)).toThrow('Design days must be a positive number');
    });

    it('should reject text in frontend days field', () => {
      const invalidRow: CSVRow = {
        Module: 'Invalid Module',
        'Design (days)': '5',
        'Front-end (days)': 'abc',
        'Back-end (days)': '10',
        'Design Performers': 'UI Designer',
        'Development Performers': 'Frontend Developer',
      };

      const validated = validateCSVRow(invalidRow, 0);
      expect(() => csvRowToModule(validated, 0)).toThrow(ValidationError);
      expect(() => csvRowToModule(validated, 0)).toThrow('Frontend days must be a positive number');
    });
  });

  describe('Missing or empty module names', () => {
    it('should reject empty module name', () => {
      const invalidRow: CSVRow = {
        Module: '',
        'Design (days)': '5',
        'Front-end (days)': '8',
        'Back-end (days)': '10',
        'Design Performers': 'UI Designer',
        'Development Performers': 'Frontend Developer',
      };

      const validated = validateCSVRow(invalidRow, 0);
      expect(() => csvRowToModule(validated, 0)).toThrow(ValidationError);
      expect(() => csvRowToModule(validated, 0)).toThrow('Module name cannot be empty');
    });

    it('should reject whitespace-only module name', () => {
      const invalidRow: CSVRow = {
        Module: '   ',
        'Design (days)': '5',
        'Front-end (days)': '8',
        'Back-end (days)': '10',
        'Design Performers': 'UI Designer',
        'Development Performers': 'Frontend Developer',
      };

      const validated = validateCSVRow(invalidRow, 0);
      expect(() => csvRowToModule(validated, 0)).toThrow(ValidationError);
      expect(() => csvRowToModule(validated, 0)).toThrow('Module name cannot be empty');
    });
  });

  describe('Large numbers', () => {
    it('should accept 1000 days (boundary value)', () => {
      const validRow: CSVRow = {
        Module: 'Large Project',
        'Design (days)': '1000',
        'Front-end (days)': '1000',
        'Back-end (days)': '1000',
        'Design Performers': 'UI Designer',
        'Development Performers': 'Frontend Developer, Backend Developer',
      };

      const validated = validateCSVRow(validRow, 0);
      const module = csvRowToModule(validated, 0);

      expect(module.designDays).toBe(1000);
      expect(module.frontendDays).toBe(1000);
      expect(module.backendDays).toBe(1000);
    });

    it('should reject days over 1000', () => {
      const invalidRow: CSVRow = {
        Module: 'Too Large',
        'Design (days)': '1001',
        'Front-end (days)': '500',
        'Back-end (days)': '500',
        'Design Performers': 'UI Designer',
        'Development Performers': 'Frontend Developer',
      };

      const validated = validateCSVRow(invalidRow, 0);
      expect(() => csvRowToModule(validated, 0)).toThrow(ValidationError);
      expect(() => csvRowToModule(validated, 0)).toThrow('Design days must be between 0 and 1000');
    });

    it('should reject extremely large numbers', () => {
      const invalidRow: CSVRow = {
        Module: 'Extreme Project',
        'Design (days)': '999999',
        'Front-end (days)': '500',
        'Back-end (days)': '800',
        'Design Performers': 'UI Designer',
        'Development Performers': 'Frontend Developer',
      };

      const validated = validateCSVRow(invalidRow, 0);
      expect(() => csvRowToModule(validated, 0)).toThrow(ValidationError);
    });
  });

  describe('Decimal values', () => {
    it('should accept decimal design days', () => {
      const validRow: CSVRow = {
        Module: 'Quick Task',
        'Design (days)': '5.5',
        'Front-end (days)': '8',
        'Back-end (days)': '10',
        'Design Performers': 'UI Designer',
        'Development Performers': 'Frontend Developer, Backend Developer',
      };

      const validated = validateCSVRow(validRow, 0);
      const module = csvRowToModule(validated, 0);

      expect(module.designDays).toBe(5.5);
    });

    it('should accept decimal frontend days', () => {
      const validRow: CSVRow = {
        Module: 'Quick Task',
        'Design (days)': '5',
        'Front-end (days)': '8.75',
        'Back-end (days)': '10',
        'Design Performers': 'UI Designer',
        'Development Performers': 'Frontend Developer, Backend Developer',
      };

      const validated = validateCSVRow(validRow, 0);
      const module = csvRowToModule(validated, 0);

      expect(module.frontendDays).toBe(8.75);
    });

    it('should accept decimal backend days', () => {
      const validRow: CSVRow = {
        Module: 'Quick Task',
        'Design (days)': '5',
        'Front-end (days)': '8',
        'Back-end (days)': '10.25',
        'Design Performers': 'UI Designer',
        'Development Performers': 'Frontend Developer, Backend Developer',
      };

      const validated = validateCSVRow(validRow, 0);
      const module = csvRowToModule(validated, 0);

      expect(module.backendDays).toBe(10.25);
    });

    it('should accept all decimal values', () => {
      const validRow: CSVRow = {
        Module: 'Precision Module',
        'Design (days)': '7.2',
        'Front-end (days)': '15.8',
        'Back-end (days)': '12.3',
        'Design Performers': 'UI Designer',
        'Development Performers': 'Frontend Developer, Backend Developer',
      };

      const validated = validateCSVRow(validRow, 0);
      const module = csvRowToModule(validated, 0);

      expect(module.designDays).toBe(7.2);
      expect(module.frontendDays).toBe(15.8);
      expect(module.backendDays).toBe(12.3);
    });

    it('should accept comma decimal in design days (European format)', () => {
      const validRow: CSVRow = {
        Module: 'European Format Test',
        'Design (days)': '5,5',
        'Front-end (days)': '8',
        'Back-end (days)': '10',
        'Design Performers': 'UI Designer',
        'Development Performers': 'Frontend Developer, Backend Developer',
      };

      const validated = validateCSVRow(validRow, 0);
      const module = csvRowToModule(validated, 0);

      expect(module.designDays).toBe(5.5);
    });

    it('should accept comma decimal in frontend days', () => {
      const validRow: CSVRow = {
        Module: 'Comma Test',
        'Design (days)': '5',
        'Front-end (days)': '8,75',
        'Back-end (days)': '10',
        'Design Performers': 'UI Designer',
        'Development Performers': 'Frontend Developer, Backend Developer',
      };

      const validated = validateCSVRow(validRow, 0);
      const module = csvRowToModule(validated, 0);

      expect(module.frontendDays).toBe(8.75);
    });

    it('should accept comma decimal in backend days', () => {
      const validRow: CSVRow = {
        Module: 'Comma Test',
        'Design (days)': '5',
        'Front-end (days)': '8',
        'Back-end (days)': '10,25',
        'Design Performers': 'UI Designer',
        'Development Performers': 'Frontend Developer, Backend Developer',
      };

      const validated = validateCSVRow(validRow, 0);
      const module = csvRowToModule(validated, 0);

      expect(module.backendDays).toBe(10.25);
    });

    it('should handle all comma decimals (European format)', () => {
      const validRow: CSVRow = {
        Module: 'All Commas',
        'Design (days)': '7,2',
        'Front-end (days)': '15,8',
        'Back-end (days)': '12,3',
        'Design Performers': 'UI Designer',
        'Development Performers': 'Frontend Developer, Backend Developer',
      };

      const validated = validateCSVRow(validRow, 0);
      const module = csvRowToModule(validated, 0);

      expect(module.designDays).toBe(7.2);
      expect(module.frontendDays).toBe(15.8);
      expect(module.backendDays).toBe(12.3);
    });

    it('should handle mixed comma and dot decimals in same CSV', () => {
      const mixedRows: CSVRow[] = [
        {
          Module: 'Dot Format',
          'Design (days)': '5.5',
          'Front-end (days)': '8.75',
          'Back-end (days)': '10.25',
          'Design Performers': 'UI Designer',
          'Development Performers': 'Frontend Developer, Backend Developer',
        },
        {
          Module: 'Comma Format',
          'Design (days)': '5,5',
          'Front-end (days)': '8,75',
          'Back-end (days)': '10,25',
          'Design Performers': 'UI Designer',
          'Development Performers': 'Frontend Developer, Backend Developer',
        },
      ];

      mixedRows.forEach((row, index) => {
        const validated = validateCSVRow(row, index);
        const module = csvRowToModule(validated, index);

        // Both should produce identical results
        expect(module.designDays).toBe(5.5);
        expect(module.frontendDays).toBe(8.75);
        expect(module.backendDays).toBe(10.25);
      });
    });

    it('should accept 0,5 format (European zero decimal)', () => {
      const validRow: CSVRow = {
        Module: 'Half Day',
        'Design (days)': '0,5',
        'Front-end (days)': '0,5',
        'Back-end (days)': '1,5',
        'Design Performers': 'UI Designer',
        'Development Performers': 'Frontend Developer, Backend Developer',
      };

      const validated = validateCSVRow(validRow, 0);
      const module = csvRowToModule(validated, 0);

      expect(module.designDays).toBe(0.5);
      expect(module.frontendDays).toBe(0.5);
      expect(module.backendDays).toBe(1.5);
    });
  });

  describe('Special characters and Unicode', () => {
    it('should handle Unicode in module names', () => {
      const validRow: CSVRow = {
        Module: '用户仪表板',
        'Design (days)': '7',
        'Front-end (days)': '15',
        'Back-end (days)': '12',
        'Design Performers': 'UI Designer',
        'Development Performers': 'Frontend Developer, Backend Developer',
      };

      const validated = validateCSVRow(validRow, 0);
      const module = csvRowToModule(validated, 0);

      expect(module.name).toBe('用户仪表板');
    });

    it('should handle Unicode in performer names', () => {
      const validRow: CSVRow = {
        Module: 'Dashboard',
        'Design (days)': '7',
        'Front-end (days)': '15',
        'Back-end (days)': '12',
        'Design Performers': 'デザイナー',
        'Development Performers': 'Développeur Frontend, Desarrollador Backend',
      };

      const validated = validateCSVRow(validRow, 0);
      const module = csvRowToModule(validated, 0);

      expect(module.designPerformers).toEqual(['デザイナー']);
      expect(module.developmentPerformers).toEqual(['Développeur Frontend', 'Desarrollador Backend']);
    });

    it('should handle special characters in module names', () => {
      const validRow: CSVRow = {
        Module: 'Authentication & Authorization',
        'Design (days)': '5',
        'Front-end (days)': '8',
        'Back-end (days)': '10',
        'Design Performers': 'UI Designer',
        'Development Performers': 'Frontend Developer, Backend Developer',
      };

      const validated = validateCSVRow(validRow, 0);
      const module = csvRowToModule(validated, 0);

      expect(module.name).toBe('Authentication & Authorization');
    });

    it('should handle parentheses in performer names', () => {
      const validRow: CSVRow = {
        Module: 'Test Module',
        'Design (days)': '5',
        'Front-end (days)': '8',
        'Back-end (days)': '10',
        'Design Performers': 'UI Designer (Lead), UX Designer',
        'Development Performers': 'Frontend Dev, Backend Dev',
      };

      const validated = validateCSVRow(validRow, 0);
      const module = csvRowToModule(validated, 0);

      expect(module.designPerformers).toEqual(['UI Designer (Lead)', 'UX Designer']);
    });
  });

  describe('Zero values', () => {
    it('should accept module with all zeros', () => {
      const validRow: CSVRow = {
        Module: 'Placeholder',
        'Design (days)': '0',
        'Front-end (days)': '0',
        'Back-end (days)': '0',
        'Design Performers': 'UI Designer',
        'Development Performers': 'Frontend Developer',
      };

      const validated = validateCSVRow(validRow, 0);
      const module = csvRowToModule(validated, 0);

      expect(module.designDays).toBe(0);
      expect(module.frontendDays).toBe(0);
      expect(module.backendDays).toBe(0);
    });

    it('should accept 0 as valid day value', () => {
      const validRow: CSVRow = {
        Module: 'Mixed Zeros',
        'Design (days)': '0',
        'Front-end (days)': '5',
        'Back-end (days)': '0',
        'Design Performers': '',
        'Development Performers': 'Frontend Developer',
      };

      const validated = validateCSVRow(validRow, 0);
      const module = csvRowToModule(validated, 0);

      expect(module.designDays).toBe(0);
      expect(module.frontendDays).toBe(5);
      expect(module.backendDays).toBe(0);
    });
  });
});
