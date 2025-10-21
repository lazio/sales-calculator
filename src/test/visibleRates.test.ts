import { describe, it, expect } from 'vitest';
import { extractUniquePerformers, getMissingPerformers } from '@/utils/performers';
import { ProjectModule } from '@/types/project.types';
import { RateConfig } from '@/types/rates.types';

describe('Visible Rates Filtering', () => {
  const mockRates: RateConfig[] = [
    { role: 'UI Designer', monthlyRate: 5000 },
    { role: 'Frontend Developer', monthlyRate: 6000 },
    { role: 'Backend Developer', monthlyRate: 7000 },
    { role: 'DevOps Engineer', monthlyRate: 8000 },
    { role: 'QA Engineer', monthlyRate: 5500 },
  ];

  describe('Extract Unique Performers', () => {
    it('should extract all unique performers from modules', () => {
      const modules: ProjectModule[] = [
        {
          id: 'module-1',
          name: 'Module 1',
          designDays: 10,
          frontendDays: 15,
          backendDays: 20,
          designPerformers: ['UI Designer'],
          developmentPerformers: ['Frontend Developer', 'Backend Developer'],
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

      const performers = extractUniquePerformers(modules);

      expect(performers).toHaveLength(3);
      expect(performers).toContain('UI Designer');
      expect(performers).toContain('Frontend Developer');
      expect(performers).toContain('Backend Developer');
      expect(performers).not.toContain('DevOps Engineer');
    });

    it('should handle empty modules array', () => {
      const performers = extractUniquePerformers([]);

      expect(performers).toHaveLength(0);
      expect(performers).toEqual([]);
    });

    it('should deduplicate performers across modules', () => {
      const modules: ProjectModule[] = [
        {
          id: 'module-1',
          name: 'Module 1',
          designDays: 10,
          frontendDays: 0,
          backendDays: 0,
          designPerformers: ['UI Designer'],
          developmentPerformers: [],
          isEnabled: true,
        },
        {
          id: 'module-2',
          name: 'Module 2',
          designDays: 5,
          frontendDays: 0,
          backendDays: 0,
          designPerformers: ['UI Designer'],
          developmentPerformers: [],
          isEnabled: true,
        },
      ];

      const performers = extractUniquePerformers(modules);

      expect(performers).toHaveLength(1);
      expect(performers).toEqual(['UI Designer']);
    });

    it('should extract from both design and development performers', () => {
      const modules: ProjectModule[] = [
        {
          id: 'module-1',
          name: 'Module 1',
          designDays: 10,
          frontendDays: 15,
          backendDays: 20,
          designPerformers: ['UI Designer', 'UX Designer'],
          developmentPerformers: ['Frontend Developer', 'Backend Developer', 'DevOps Engineer'],
          isEnabled: true,
        },
      ];

      const performers = extractUniquePerformers(modules);

      expect(performers).toHaveLength(5);
      expect(performers).toContain('UI Designer');
      expect(performers).toContain('UX Designer');
      expect(performers).toContain('Frontend Developer');
      expect(performers).toContain('Backend Developer');
      expect(performers).toContain('DevOps Engineer');
    });

    it('should return sorted list of performers', () => {
      const modules: ProjectModule[] = [
        {
          id: 'module-1',
          name: 'Module 1',
          designDays: 10,
          frontendDays: 15,
          backendDays: 20,
          designPerformers: ['UI Designer'],
          developmentPerformers: ['Frontend Developer', 'Backend Developer'],
          isEnabled: true,
        },
      ];

      const performers = extractUniquePerformers(modules);

      expect(performers).toEqual(['Backend Developer', 'Frontend Developer', 'UI Designer']);
    });
  });

  describe('Filter Visible Rates', () => {
    it('should filter rates to show only performers from current modules', () => {
      const modules: ProjectModule[] = [
        {
          id: 'module-1',
          name: 'Module 1',
          designDays: 10,
          frontendDays: 15,
          backendDays: 0,
          designPerformers: ['UI Designer'],
          developmentPerformers: ['Frontend Developer'],
          isEnabled: true,
        },
      ];

      const performersInModules = extractUniquePerformers(modules);
      const performersSet = new Set(performersInModules);
      const visibleRates = mockRates.filter(rate => performersSet.has(rate.role));

      expect(visibleRates).toHaveLength(2);
      expect(visibleRates.map(r => r.role)).toContain('UI Designer');
      expect(visibleRates.map(r => r.role)).toContain('Frontend Developer');
      expect(visibleRates.map(r => r.role)).not.toContain('Backend Developer');
      expect(visibleRates.map(r => r.role)).not.toContain('DevOps Engineer');
      expect(visibleRates.map(r => r.role)).not.toContain('QA Engineer');
    });

    it('should show all matching rates when modules use all performers', () => {
      const modules: ProjectModule[] = [
        {
          id: 'module-1',
          name: 'Module 1',
          designDays: 10,
          frontendDays: 15,
          backendDays: 20,
          designPerformers: ['UI Designer'],
          developmentPerformers: ['Frontend Developer', 'Backend Developer', 'DevOps Engineer', 'QA Engineer'],
          isEnabled: true,
        },
      ];

      const performersInModules = extractUniquePerformers(modules);
      const performersSet = new Set(performersInModules);
      const visibleRates = mockRates.filter(rate => performersSet.has(rate.role));

      expect(visibleRates).toHaveLength(5);
      expect(visibleRates).toEqual(mockRates);
    });

    it('should show no rates when no modules are loaded', () => {
      const modules: ProjectModule[] = [];

      const performersInModules = extractUniquePerformers(modules);
      const performersSet = new Set(performersInModules);
      const visibleRates = mockRates.filter(rate => performersSet.has(rate.role));

      expect(visibleRates).toHaveLength(0);
      expect(visibleRates).toEqual([]);
    });

    it('should preserve rate values when filtering', () => {
      const modules: ProjectModule[] = [
        {
          id: 'module-1',
          name: 'Module 1',
          designDays: 10,
          frontendDays: 0,
          backendDays: 0,
          designPerformers: ['UI Designer'],
          developmentPerformers: [],
          isEnabled: true,
        },
      ];

      const performersInModules = extractUniquePerformers(modules);
      const performersSet = new Set(performersInModules);
      const visibleRates = mockRates.filter(rate => performersSet.has(rate.role));

      expect(visibleRates).toHaveLength(1);
      expect(visibleRates[0].role).toBe('UI Designer');
      expect(visibleRates[0].monthlyRate).toBe(5000);
    });

    it('should update visible rates when modules change', () => {
      // Initial modules with only UI Designer
      let modules: ProjectModule[] = [
        {
          id: 'module-1',
          name: 'Module 1',
          designDays: 10,
          frontendDays: 0,
          backendDays: 0,
          designPerformers: ['UI Designer'],
          developmentPerformers: [],
          isEnabled: true,
        },
      ];

      let performersInModules = extractUniquePerformers(modules);
      let performersSet = new Set(performersInModules);
      let visibleRates = mockRates.filter(rate => performersSet.has(rate.role));

      expect(visibleRates).toHaveLength(1);
      expect(visibleRates[0].role).toBe('UI Designer');

      // Import new CSV with different performers
      modules = [
        {
          id: 'module-2',
          name: 'Module 2',
          designDays: 0,
          frontendDays: 15,
          backendDays: 20,
          designPerformers: [],
          developmentPerformers: ['Frontend Developer', 'Backend Developer'],
          isEnabled: true,
        },
      ];

      performersInModules = extractUniquePerformers(modules);
      performersSet = new Set(performersInModules);
      visibleRates = mockRates.filter(rate => performersSet.has(rate.role));

      expect(visibleRates).toHaveLength(2);
      expect(visibleRates.map(r => r.role)).toContain('Frontend Developer');
      expect(visibleRates.map(r => r.role)).toContain('Backend Developer');
      expect(visibleRates.map(r => r.role)).not.toContain('UI Designer');
    });
  });

  describe('Get Missing Performers', () => {
    it('should identify performers not in rates list', () => {
      const modules: ProjectModule[] = [
        {
          id: 'module-1',
          name: 'Module 1',
          designDays: 10,
          frontendDays: 15,
          backendDays: 20,
          designPerformers: ['UI Designer', 'UX Designer'],
          developmentPerformers: ['Frontend Developer', 'Full Stack Developer'],
          isEnabled: true,
        },
      ];

      const existingRoles = mockRates.map(r => r.role);
      const missingPerformers = getMissingPerformers(modules, existingRoles);

      expect(missingPerformers).toHaveLength(2);
      expect(missingPerformers).toContain('UX Designer');
      expect(missingPerformers).toContain('Full Stack Developer');
      expect(missingPerformers).not.toContain('UI Designer');
      expect(missingPerformers).not.toContain('Frontend Developer');
    });

    it('should return empty array when all performers have rates', () => {
      const modules: ProjectModule[] = [
        {
          id: 'module-1',
          name: 'Module 1',
          designDays: 10,
          frontendDays: 15,
          backendDays: 20,
          designPerformers: ['UI Designer'],
          developmentPerformers: ['Frontend Developer', 'Backend Developer'],
          isEnabled: true,
        },
      ];

      const existingRoles = mockRates.map(r => r.role);
      const missingPerformers = getMissingPerformers(modules, existingRoles);

      expect(missingPerformers).toHaveLength(0);
      expect(missingPerformers).toEqual([]);
    });

    it('should return all performers when no rates exist', () => {
      const modules: ProjectModule[] = [
        {
          id: 'module-1',
          name: 'Module 1',
          designDays: 10,
          frontendDays: 15,
          backendDays: 20,
          designPerformers: ['UI Designer'],
          developmentPerformers: ['Frontend Developer', 'Backend Developer'],
          isEnabled: true,
        },
      ];

      const existingRoles: string[] = [];
      const missingPerformers = getMissingPerformers(modules, existingRoles);

      expect(missingPerformers).toHaveLength(3);
      expect(missingPerformers).toContain('UI Designer');
      expect(missingPerformers).toContain('Frontend Developer');
      expect(missingPerformers).toContain('Backend Developer');
    });
  });

  describe('LocalStorage Persistence', () => {
    it('should keep rates in localStorage even when not visible', () => {
      // All rates are stored
      const allRates = mockRates;

      // But only some are visible based on current CSV
      const modules: ProjectModule[] = [
        {
          id: 'module-1',
          name: 'Module 1',
          designDays: 10,
          frontendDays: 0,
          backendDays: 0,
          designPerformers: ['UI Designer'],
          developmentPerformers: [],
          isEnabled: true,
        },
      ];

      const performersInModules = extractUniquePerformers(modules);
      const performersSet = new Set(performersInModules);
      const visibleRates = allRates.filter(rate => performersSet.has(rate.role));

      // Visible rates are filtered
      expect(visibleRates).toHaveLength(1);

      // But all rates still exist in storage
      expect(allRates).toHaveLength(5);
      expect(allRates).toEqual(mockRates);
    });

    it('should restore previously saved rates when CSV includes those performers', () => {
      // Full rates in localStorage
      const storedRates = mockRates;

      // Import CSV with performer that has existing rate
      const modules: ProjectModule[] = [
        {
          id: 'module-1',
          name: 'Module 1',
          designDays: 0,
          frontendDays: 0,
          backendDays: 20,
          designPerformers: [],
          developmentPerformers: ['DevOps Engineer'],
          isEnabled: true,
        },
      ];

      const performersInModules = extractUniquePerformers(modules);
      const performersSet = new Set(performersInModules);
      const visibleRates = storedRates.filter(rate => performersSet.has(rate.role));

      // Should show the DevOps Engineer rate from localStorage
      expect(visibleRates).toHaveLength(1);
      expect(visibleRates[0].role).toBe('DevOps Engineer');
      expect(visibleRates[0].monthlyRate).toBe(8000);
    });
  });
});
