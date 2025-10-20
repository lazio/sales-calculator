import { describe, it, expect } from 'vitest';
import { extractUniquePerformers, getMissingPerformers } from './performers';
import { ProjectModule } from '@/types/project.types';

describe('performers', () => {
  const mockModules: ProjectModule[] = [
    {
      id: 'module-1',
      name: 'Feature A',
      designDays: 3,
      frontendDays: 5,
      backendDays: 8,
      designPerformers: ['UI Designer'],
      developmentPerformers: ['Frontend Developer', 'Backend Developer', 'QA Engineer'],
      isEnabled: true,
    },
    {
      id: 'module-2',
      name: 'Feature B',
      designDays: 2,
      frontendDays: 3,
      backendDays: 4,
      designPerformers: ['UI Designer', 'UX Designer'],
      developmentPerformers: ['Frontend Developer', 'Backend Developer', 'PM'],
      isEnabled: true,
    },
  ];

  describe('extractUniquePerformers', () => {
    it('should extract all unique performers from modules', () => {
      const performers = extractUniquePerformers(mockModules);

      expect(performers).toContain('UI Designer');
      expect(performers).toContain('UX Designer');
      expect(performers).toContain('Frontend Developer');
      expect(performers).toContain('Backend Developer');
      expect(performers).toContain('QA Engineer');
      expect(performers).toContain('PM');
      expect(performers).toHaveLength(6);
    });

    it('should return sorted list', () => {
      const performers = extractUniquePerformers(mockModules);

      // Should be alphabetically sorted
      expect(performers).toEqual([
        'Backend Developer',
        'Frontend Developer',
        'PM',
        'QA Engineer',
        'UI Designer',
        'UX Designer',
      ]);
    });

    it('should handle modules with no performers', () => {
      const emptyModules: ProjectModule[] = [
        {
          id: 'module-empty',
          name: 'Empty',
          designDays: 0,
          frontendDays: 5,
          backendDays: 5,
          designPerformers: [],
          developmentPerformers: [],
          isEnabled: true,
        },
      ];

      const performers = extractUniquePerformers(emptyModules);
      expect(performers).toEqual([]);
    });

    it('should handle empty module list', () => {
      const performers = extractUniquePerformers([]);
      expect(performers).toEqual([]);
    });

    it('should deduplicate performers across modules', () => {
      const modulesWithDuplicates: ProjectModule[] = [
        {
          id: 'module-1',
          name: 'A',
          designDays: 2,
          frontendDays: 3,
          backendDays: 3,
          designPerformers: ['UI Designer'],
          developmentPerformers: ['Frontend Developer'],
          isEnabled: true,
        },
        {
          id: 'module-2',
          name: 'B',
          designDays: 2,
          frontendDays: 3,
          backendDays: 3,
          designPerformers: ['UI Designer'], // Duplicate
          developmentPerformers: ['Frontend Developer'], // Duplicate
          isEnabled: true,
        },
      ];

      const performers = extractUniquePerformers(modulesWithDuplicates);
      expect(performers).toEqual(['Frontend Developer', 'UI Designer']);
    });
  });

  describe('getMissingPerformers', () => {
    it('should identify performers not in existing rates', () => {
      const existingRoles = ['Frontend Developer', 'Backend Developer'];
      const missing = getMissingPerformers(mockModules, existingRoles);

      expect(missing).toContain('UI Designer');
      expect(missing).toContain('UX Designer');
      expect(missing).toContain('QA Engineer');
      expect(missing).toContain('PM');
      expect(missing).not.toContain('Frontend Developer');
      expect(missing).not.toContain('Backend Developer');
    });

    it('should return empty array when all performers exist', () => {
      const existingRoles = [
        'UI Designer',
        'UX Designer',
        'Frontend Developer',
        'Backend Developer',
        'QA Engineer',
        'PM',
      ];
      const missing = getMissingPerformers(mockModules, existingRoles);

      expect(missing).toEqual([]);
    });

    it('should return all performers when no existing roles', () => {
      const missing = getMissingPerformers(mockModules, []);

      expect(missing).toHaveLength(6);
      expect(missing).toContain('UI Designer');
    });
  });
});
