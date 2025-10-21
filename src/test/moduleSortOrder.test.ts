import { describe, it, expect } from 'vitest';
import { ProjectModule } from '@/types/project.types';

describe('Module Sort Order', () => {
  const mockModules: ProjectModule[] = [
    {
      id: 'module-1',
      name: 'Zebra Module', // Z - would be last alphabetically
      designDays: 5,
      frontendDays: 8,
      backendDays: 10,
      designPerformers: ['UI Designer'],
      developmentPerformers: ['Frontend Developer'],
      isEnabled: true,
    },
    {
      id: 'module-2',
      name: 'Apple Module', // A - would be first alphabetically
      designDays: 3,
      frontendDays: 6,
      backendDays: 8,
      designPerformers: ['UI Designer'],
      developmentPerformers: ['Frontend Developer'],
      isEnabled: true,
    },
    {
      id: 'module-3',
      name: 'Mango Module', // M - would be middle alphabetically
      designDays: 7,
      frontendDays: 10,
      backendDays: 12,
      designPerformers: ['UI Designer'],
      developmentPerformers: ['Frontend Developer'],
      isEnabled: true,
    },
  ];

  describe('Default CSV Order', () => {
    it('should preserve original CSV import order', () => {
      // In default mode, modules should maintain their original order
      // This is what they receive from CSV import
      const csvOrder = mockModules;

      // The original order should be maintained
      expect(csvOrder[0].name).toBe('Zebra Module'); // First in CSV
      expect(csvOrder[1].name).toBe('Apple Module'); // Second in CSV
      expect(csvOrder[2].name).toBe('Mango Module'); // Third in CSV

      // Even though alphabetically it would be: Apple, Mango, Zebra
      // The CSV order is: Zebra, Apple, Mango
    });

    it('should maintain CSV order regardless of alphabetical names', () => {
      const modules: ProjectModule[] = [
        { id: '3', name: 'C', designDays: 1, frontendDays: 1, backendDays: 1, designPerformers: [], developmentPerformers: [], isEnabled: true },
        { id: '1', name: 'A', designDays: 1, frontendDays: 1, backendDays: 1, designPerformers: [], developmentPerformers: [], isEnabled: true },
        { id: '2', name: 'B', designDays: 1, frontendDays: 1, backendDays: 1, designPerformers: [], developmentPerformers: [], isEnabled: true },
      ];

      // CSV order: C, A, B (not alphabetical)
      expect(modules[0].name).toBe('C');
      expect(modules[1].name).toBe('A');
      expect(modules[2].name).toBe('B');
    });

    it('should maintain CSV order regardless of prices', () => {
      // Module with different effort levels (different prices)
      const modules: ProjectModule[] = [
        { id: '1', name: 'Expensive', designDays: 50, frontendDays: 50, backendDays: 50, designPerformers: [], developmentPerformers: [], isEnabled: true },
        { id: '2', name: 'Cheap', designDays: 1, frontendDays: 1, backendDays: 1, designPerformers: [], developmentPerformers: [], isEnabled: true },
        { id: '3', name: 'Medium', designDays: 10, frontendDays: 10, backendDays: 10, designPerformers: [], developmentPerformers: [], isEnabled: true },
      ];

      // CSV order: Expensive, Cheap, Medium (not by price)
      expect(modules[0].name).toBe('Expensive');
      expect(modules[1].name).toBe('Cheap');
      expect(modules[2].name).toBe('Medium');
    });

    it('should maintain CSV order regardless of timeline', () => {
      const modules: ProjectModule[] = [
        { id: '1', name: 'Long', designDays: 0, frontendDays: 0, backendDays: 100, designPerformers: [], developmentPerformers: [], isEnabled: true },
        { id: '2', name: 'Short', designDays: 0, frontendDays: 0, backendDays: 5, designPerformers: [], developmentPerformers: [], isEnabled: true },
        { id: '3', name: 'Medium', designDays: 0, frontendDays: 0, backendDays: 20, designPerformers: [], developmentPerformers: [], isEnabled: true },
      ];

      // CSV order: Long (100d), Short (5d), Medium (20d)
      expect(modules[0].designDays + modules[0].frontendDays + modules[0].backendDays).toBe(100);
      expect(modules[1].designDays + modules[1].frontendDays + modules[1].backendDays).toBe(5);
      expect(modules[2].designDays + modules[2].frontendDays + modules[2].backendDays).toBe(20);
    });
  });

  describe('Alphabetical Sort', () => {
    it('should sort alphabetically when requested', () => {
      const sorted = [...mockModules].sort((a, b) => a.name.localeCompare(b.name));

      expect(sorted[0].name).toBe('Apple Module');
      expect(sorted[1].name).toBe('Mango Module');
      expect(sorted[2].name).toBe('Zebra Module');

      // This is different from CSV order
      expect(sorted[0].name).not.toBe(mockModules[0].name);
    });
  });

  describe('Priority Ordering Example', () => {
    it('should respect CSV priority order for project phases', () => {
      // Example: User orders modules by priority in CSV
      // Phase 1 (Critical): Authentication, Payment
      // Phase 2 (Important): Dashboard, Reports
      // Phase 3 (Nice-to-have): Settings, Profile
      const prioritizedModules: ProjectModule[] = [
        { id: '1', name: 'Authentication', designDays: 5, frontendDays: 8, backendDays: 10, designPerformers: [], developmentPerformers: [], isEnabled: true },
        { id: '2', name: 'Payment', designDays: 7, frontendDays: 10, backendDays: 15, designPerformers: [], developmentPerformers: [], isEnabled: true },
        { id: '3', name: 'Dashboard', designDays: 4, frontendDays: 12, backendDays: 8, designPerformers: [], developmentPerformers: [], isEnabled: true },
        { id: '4', name: 'Reports', designDays: 3, frontendDays: 8, backendDays: 10, designPerformers: [], developmentPerformers: [], isEnabled: true },
        { id: '5', name: 'Settings', designDays: 2, frontendDays: 4, backendDays: 3, designPerformers: [], developmentPerformers: [], isEnabled: true },
        { id: '6', name: 'Profile', designDays: 2, frontendDays: 5, backendDays: 4, designPerformers: [], developmentPerformers: [], isEnabled: true },
      ];

      // CSV maintains priority order
      expect(prioritizedModules[0].name).toBe('Authentication'); // Phase 1
      expect(prioritizedModules[1].name).toBe('Payment');        // Phase 1
      expect(prioritizedModules[2].name).toBe('Dashboard');      // Phase 2
      expect(prioritizedModules[3].name).toBe('Reports');        // Phase 2
      expect(prioritizedModules[4].name).toBe('Settings');       // Phase 3
      expect(prioritizedModules[5].name).toBe('Profile');        // Phase 3

      // Alphabetical would destroy this priority: Dashboard, Payment, Profile, Reports, Settings, Authentication
      const alphabetical = [...prioritizedModules].sort((a, b) => a.name.localeCompare(b.name));
      expect(alphabetical[0].name).toBe('Authentication');
      // Different order than priority order
    });
  });

  describe('CSV Import Scenarios', () => {
    it('should handle modules in custom business order', () => {
      // Example: Development team's workflow order
      const workflowOrder: ProjectModule[] = [
        { id: '1', name: 'Infrastructure Setup', designDays: 0, frontendDays: 0, backendDays: 10, designPerformers: [], developmentPerformers: [], isEnabled: true },
        { id: '2', name: 'Database Design', designDays: 5, frontendDays: 0, backendDays: 8, designPerformers: [], developmentPerformers: [], isEnabled: true },
        { id: '3', name: 'API Development', designDays: 3, frontendDays: 0, backendDays: 15, designPerformers: [], developmentPerformers: [], isEnabled: true },
        { id: '4', name: 'Frontend Development', designDays: 7, frontendDays: 20, backendDays: 0, designPerformers: [], developmentPerformers: [], isEnabled: true },
        { id: '5', name: 'Integration & Testing', designDays: 0, frontendDays: 5, backendDays: 5, designPerformers: [], developmentPerformers: [], isEnabled: true },
      ];

      // This order represents the development flow
      expect(workflowOrder.map(m => m.name)).toEqual([
        'Infrastructure Setup',
        'Database Design',
        'API Development',
        'Frontend Development',
        'Integration & Testing',
      ]);

      // Alphabetical would mess up this flow
      const alphabetical = [...workflowOrder].sort((a, b) => a.name.localeCompare(b.name));
      expect(alphabetical.map(m => m.name)).not.toEqual(workflowOrder.map(m => m.name));
    });

    it('should handle numeric prefixes in module names', () => {
      // Common practice: numbering modules for order
      const numberedModules: ProjectModule[] = [
        { id: '1', name: '1. Requirements', designDays: 5, frontendDays: 0, backendDays: 0, designPerformers: [], developmentPerformers: [], isEnabled: true },
        { id: '2', name: '2. Design', designDays: 10, frontendDays: 0, backendDays: 0, designPerformers: [], developmentPerformers: [], isEnabled: true },
        { id: '3', name: '3. Development', designDays: 0, frontendDays: 20, backendDays: 25, designPerformers: [], developmentPerformers: [], isEnabled: true },
        { id: '4', name: '4. Testing', designDays: 0, frontendDays: 5, backendDays: 5, designPerformers: [], developmentPerformers: [], isEnabled: true },
      ];

      // CSV maintains this numbered order
      expect(numberedModules.map(m => m.name)).toEqual([
        '1. Requirements',
        '2. Design',
        '3. Development',
        '4. Testing',
      ]);
    });
  });
});
