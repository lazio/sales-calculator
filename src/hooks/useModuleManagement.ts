import { useState, useCallback } from 'react';
import { ProjectModule } from '@/types/project.types';
import { RateConfig } from '@/types/rates.types';
import { getMissingPerformers } from '@/utils/performers';

interface UseModuleManagementProps {
  onRatesAdded?: (newRates: RateConfig[]) => void;
  existingRoles: string[];
}

/**
 * Custom hook for managing project modules
 */
export function useModuleManagement({ onRatesAdded, existingRoles }: UseModuleManagementProps) {
  const [modules, setModules] = useState<ProjectModule[]>([]);

  // Toggle a module's enabled state
  const toggleModule = useCallback((id: string) => {
    setModules(prev => prev.map(m =>
      m.id === id ? { ...m, isEnabled: !m.isEnabled } : m
    ));
  }, []);

  // Bulk toggle all modules
  const bulkToggle = useCallback((enabled: boolean) => {
    setModules(prev => prev.map(m => ({ ...m, isEnabled: enabled })));
  }, []);

  // Add a new module
  const addModule = useCallback((moduleData: {
    name: string;
    designDays: number;
    frontendDays: number;
    backendDays: number;
    designPerformers: string[];
    developmentPerformers: string[];
  }) => {
    // Generate unique ID using timestamp
    const id = `module-${Date.now()}`;

    // Create new module
    const newModule: ProjectModule = {
      id,
      name: moduleData.name,
      designDays: moduleData.designDays,
      frontendDays: moduleData.frontendDays,
      backendDays: moduleData.backendDays,
      designPerformers: moduleData.designPerformers,
      developmentPerformers: moduleData.developmentPerformers,
      isEnabled: true, // Enabled by default
    };

    // Add to modules array at the top
    setModules(prev => [newModule, ...prev]);

    // Auto-create missing performers
    const missingPerformers = getMissingPerformers([newModule], existingRoles);

    if (missingPerformers.length > 0 && onRatesAdded) {
      const newRates: RateConfig[] = missingPerformers.map(role => ({
        role,
        monthlyRate: 1000, // Default rate
      }));
      onRatesAdded(newRates);
    }

    return newModule;
  }, [existingRoles, onRatesAdded]);

  // Import modules from CSV
  const importModules = useCallback((importedModules: ProjectModule[]) => {
    setModules(importedModules);

    // Add missing performers to rates
    const missingPerformers = getMissingPerformers(importedModules, existingRoles);

    if (missingPerformers.length > 0 && onRatesAdded) {
      const newRates: RateConfig[] = missingPerformers.map(role => ({
        role,
        monthlyRate: 1000, // Default rate
      }));
      onRatesAdded(newRates);
    }

    return importedModules;
  }, [existingRoles, onRatesAdded]);

  // Clear all modules
  const clearModules = useCallback(() => {
    setModules([]);
  }, []);

  return {
    modules,
    setModules,
    toggleModule,
    bulkToggle,
    addModule,
    importModules,
    clearModules
  };
}
