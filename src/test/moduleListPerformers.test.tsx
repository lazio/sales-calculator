import { describe, it, expect } from 'vitest';
import { ProjectModule } from '@/types/project.types';
import { RateConfig } from '@/types/rates.types';

describe('ModuleList Performer Display Logic', () => {
  const mockRates: RateConfig[] = [
    { role: 'UI Designer', monthlyRate: 5000 },
    { role: 'Frontend Developer', monthlyRate: 6000 },
    { role: 'Backend Developer', monthlyRate: 6000 },
  ];

  describe('Design-only modules', () => {
    it('should identify design-only module correctly', () => {
      const designOnlyModule: ProjectModule = {
        id: 'design-only',
        name: 'Design System',
        designDays: 20,
        frontendDays: 0,
        backendDays: 0,
        designPerformers: ['UI Designer'],
        developmentPerformers: [],
        isEnabled: true,
      };

      // Design performers should be shown (designDays > 0)
      const shouldShowDesignPerformers = designOnlyModule.designDays > 0 &&
                                         designOnlyModule.designPerformers.length > 0;
      expect(shouldShowDesignPerformers).toBe(true);

      // Development performers should NOT be shown (frontendDays = 0 AND backendDays = 0)
      const shouldShowDevPerformers = (designOnlyModule.frontendDays > 0 || designOnlyModule.backendDays > 0) &&
                                      designOnlyModule.developmentPerformers.length > 0;
      expect(shouldShowDevPerformers).toBe(false);
    });

    it('should not show development performers even if they exist in array when dev days = 0', () => {
      const designOnlyWithDevPerformers: ProjectModule = {
        id: 'design-only-2',
        name: 'Wireframes',
        designDays: 10,
        frontendDays: 0,
        backendDays: 0,
        designPerformers: ['UI Designer'],
        developmentPerformers: ['Frontend Developer'], // These exist but shouldn't show
        isEnabled: true,
      };

      const shouldShowDevPerformers = (designOnlyWithDevPerformers.frontendDays > 0 ||
                                       designOnlyWithDevPerformers.backendDays > 0) &&
                                      designOnlyWithDevPerformers.developmentPerformers.length > 0;
      expect(shouldShowDevPerformers).toBe(false);
    });
  });

  describe('Development-only modules', () => {
    it('should identify backend-only module correctly', () => {
      const backendOnlyModule: ProjectModule = {
        id: 'backend-only',
        name: 'API Integration',
        designDays: 0,
        frontendDays: 0,
        backendDays: 30,
        designPerformers: [],
        developmentPerformers: ['Backend Developer'],
        isEnabled: true,
      };

      // Design performers should NOT be shown (designDays = 0)
      const shouldShowDesignPerformers = backendOnlyModule.designDays > 0 &&
                                         backendOnlyModule.designPerformers.length > 0;
      expect(shouldShowDesignPerformers).toBe(false);

      // Development performers should be shown (backendDays > 0)
      const shouldShowDevPerformers = (backendOnlyModule.frontendDays > 0 || backendOnlyModule.backendDays > 0) &&
                                      backendOnlyModule.developmentPerformers.length > 0;
      expect(shouldShowDevPerformers).toBe(true);
    });

    it('should identify frontend-only module correctly', () => {
      const frontendOnlyModule: ProjectModule = {
        id: 'frontend-only',
        name: 'UI Polish',
        designDays: 0,
        frontendDays: 15,
        backendDays: 0,
        designPerformers: [],
        developmentPerformers: ['Frontend Developer'],
        isEnabled: true,
      };

      // Design performers should NOT be shown
      const shouldShowDesignPerformers = frontendOnlyModule.designDays > 0 &&
                                         frontendOnlyModule.designPerformers.length > 0;
      expect(shouldShowDesignPerformers).toBe(false);

      // Development performers should be shown (frontendDays > 0)
      const shouldShowDevPerformers = (frontendOnlyModule.frontendDays > 0 || frontendOnlyModule.backendDays > 0) &&
                                      frontendOnlyModule.developmentPerformers.length > 0;
      expect(shouldShowDevPerformers).toBe(true);
    });

    it('should not show design performers even if they exist in array when design days = 0', () => {
      const devOnlyWithDesignPerformers: ProjectModule = {
        id: 'dev-only-2',
        name: 'Code Refactoring',
        designDays: 0,
        frontendDays: 10,
        backendDays: 15,
        designPerformers: ['UI Designer'], // These exist but shouldn't show
        developmentPerformers: ['Frontend Developer', 'Backend Developer'],
        isEnabled: true,
      };

      const shouldShowDesignPerformers = devOnlyWithDesignPerformers.designDays > 0 &&
                                         devOnlyWithDesignPerformers.designPerformers.length > 0;
      expect(shouldShowDesignPerformers).toBe(false);
    });
  });

  describe('Mixed modules', () => {
    it('should show both design and development performers when both have work', () => {
      const mixedModule: ProjectModule = {
        id: 'mixed',
        name: 'Authentication',
        designDays: 5,
        frontendDays: 8,
        backendDays: 10,
        designPerformers: ['UI Designer'],
        developmentPerformers: ['Frontend Developer', 'Backend Developer'],
        isEnabled: true,
      };

      // Both should be shown
      const shouldShowDesignPerformers = mixedModule.designDays > 0 &&
                                         mixedModule.designPerformers.length > 0;
      const shouldShowDevPerformers = (mixedModule.frontendDays > 0 || mixedModule.backendDays > 0) &&
                                      mixedModule.developmentPerformers.length > 0;

      expect(shouldShowDesignPerformers).toBe(true);
      expect(shouldShowDevPerformers).toBe(true);
    });
  });

  describe('Modules with no performers', () => {
    it('should not show performer sections when performer arrays are empty', () => {
      const noPerformersModule: ProjectModule = {
        id: 'no-performers',
        name: 'Mystery Module',
        designDays: 5,
        frontendDays: 8,
        backendDays: 10,
        designPerformers: [],
        developmentPerformers: [],
        isEnabled: true,
      };

      const shouldShowDesignPerformers = noPerformersModule.designDays > 0 &&
                                         noPerformersModule.designPerformers.length > 0;
      const shouldShowDevPerformers = (noPerformersModule.frontendDays > 0 || noPerformersModule.backendDays > 0) &&
                                      noPerformersModule.developmentPerformers.length > 0;

      expect(shouldShowDesignPerformers).toBe(false);
      expect(shouldShowDevPerformers).toBe(false);
    });
  });

  describe('Modules with all zeros', () => {
    it('should not show any performer sections when all days are 0', () => {
      const allZerosModule: ProjectModule = {
        id: 'all-zeros',
        name: 'Placeholder',
        designDays: 0,
        frontendDays: 0,
        backendDays: 0,
        designPerformers: ['UI Designer'],
        developmentPerformers: ['Frontend Developer'],
        isEnabled: true,
      };

      const shouldShowDesignPerformers = allZerosModule.designDays > 0 &&
                                         allZerosModule.designPerformers.length > 0;
      const shouldShowDevPerformers = (allZerosModule.frontendDays > 0 || allZerosModule.backendDays > 0) &&
                                      allZerosModule.developmentPerformers.length > 0;

      expect(shouldShowDesignPerformers).toBe(false);
      expect(shouldShowDevPerformers).toBe(false);
    });
  });
});
