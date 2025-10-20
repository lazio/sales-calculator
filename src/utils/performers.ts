import { ProjectModule } from '@/types/project.types';

/**
 * Extract all unique performers from a list of modules
 */
export function extractUniquePerformers(modules: ProjectModule[]): string[] {
  const uniquePerformers = new Set<string>();

  modules.forEach(module => {
    module.designPerformers.forEach(p => uniquePerformers.add(p));
    module.developmentPerformers.forEach(p => uniquePerformers.add(p));
  });

  return Array.from(uniquePerformers).sort();
}

/**
 * Get performers that are missing from the rates list
 */
export function getMissingPerformers(
  modules: ProjectModule[],
  existingRoles: string[]
): string[] {
  const allPerformers = extractUniquePerformers(modules);
  const existingRolesSet = new Set(existingRoles);

  return allPerformers.filter(p => !existingRolesSet.has(p));
}
