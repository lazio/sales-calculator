import { RateConfig } from '@/types/rates.types';
import { ProjectModule, CSVRow } from '@/types/project.types';

/**
 * Validation errors
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Type guard for RateConfig
 */
export function isRateConfig(value: unknown): value is RateConfig {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.role === 'string' &&
    typeof obj.monthlyRate === 'number' &&
    obj.monthlyRate >= 0
  );
}

/**
 * Type guard for array of RateConfig
 */
export function isRateConfigArray(value: unknown): value is RateConfig[] {
  return Array.isArray(value) && value.every(isRateConfig);
}

/**
 * Validate and sanitize RateConfig
 */
export function validateRateConfig(config: unknown): RateConfig {
  if (!isRateConfig(config)) {
    throw new ValidationError('Invalid rate configuration');
  }

  // Additional validation
  if (config.monthlyRate < 0 || config.monthlyRate > 1000000) {
    throw new ValidationError(`Monthly rate must be between 0 and 1,000,000. Got: ${config.monthlyRate}`);
  }

  if (!config.role.trim()) {
    throw new ValidationError('Role name cannot be empty');
  }

  return config;
}

/**
 * Validate array of rate configs
 */
export function validateRateConfigs(configs: unknown): RateConfig[] {
  if (!Array.isArray(configs)) {
    throw new ValidationError('Rate configs must be an array');
  }

  return configs.map((config, index) => {
    try {
      return validateRateConfig(config);
    } catch (err) {
      throw new ValidationError(
        `Invalid rate config at index ${index}: ${err instanceof Error ? err.message : 'Unknown error'}`
      );
    }
  });
}

/**
 * Type guard for ProjectModule
 */
export function isProjectModule(value: unknown): value is ProjectModule {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.designDays === 'number' &&
    typeof obj.frontendDays === 'number' &&
    typeof obj.backendDays === 'number' &&
    Array.isArray(obj.designPerformers) &&
    obj.designPerformers.every((p) => typeof p === 'string') &&
    Array.isArray(obj.developmentPerformers) &&
    obj.developmentPerformers.every((p) => typeof p === 'string') &&
    typeof obj.isEnabled === 'boolean'
  );
}

/**
 * Validate and sanitize ProjectModule
 */
export function validateProjectModule(module: unknown): ProjectModule {
  if (!isProjectModule(module)) {
    throw new ValidationError('Invalid project module');
  }

  // Additional validation
  if (module.designDays < 0 || module.designDays > 1000) {
    throw new ValidationError(
      `Design days must be between 0 and 1000. Got: ${module.designDays}`
    );
  }

  if (module.frontendDays < 0 || module.frontendDays > 1000) {
    throw new ValidationError(
      `Frontend days must be between 0 and 1000. Got: ${module.frontendDays}`
    );
  }

  if (module.backendDays < 0 || module.backendDays > 1000) {
    throw new ValidationError(
      `Backend days must be between 0 and 1000. Got: ${module.backendDays}`
    );
  }

  if (!module.name.trim()) {
    throw new ValidationError('Module name cannot be empty');
  }

  return module;
}

/**
 * Validate CSV row data
 */
export function validateCSVRow(row: unknown, rowIndex: number): CSVRow {
  if (typeof row !== 'object' || row === null) {
    throw new ValidationError(`Row ${rowIndex + 1}: Invalid row data`);
  }

  const obj = row as Record<string, unknown>;

  // Check required fields
  if (typeof obj.Module !== 'string') {
    throw new ValidationError(`Row ${rowIndex + 1}: Missing or invalid 'Module' field`);
  }

  if (typeof obj['Design (days)'] !== 'string' && typeof obj['Design (days)'] !== 'number') {
    throw new ValidationError(`Row ${rowIndex + 1}: Missing or invalid 'Design (days)' field`);
  }

  if (typeof obj['Front-end (days)'] !== 'string' && typeof obj['Front-end (days)'] !== 'number') {
    throw new ValidationError(`Row ${rowIndex + 1}: Missing or invalid 'Front-end (days)' field`);
  }

  if (typeof obj['Back-end (days)'] !== 'string' && typeof obj['Back-end (days)'] !== 'number') {
    throw new ValidationError(`Row ${rowIndex + 1}: Missing or invalid 'Back-end (days)' field`);
  }

  if (typeof obj['Design Performers'] !== 'string') {
    throw new ValidationError(`Row ${rowIndex + 1}: Missing or invalid 'Design Performers' field`);
  }

  if (typeof obj['Development Performers'] !== 'string') {
    throw new ValidationError(`Row ${rowIndex + 1}: Missing or invalid 'Development Performers' field`);
  }

  return obj as unknown as CSVRow;
}

/**
 * Convert and validate CSV row to ProjectModule
 */
export function csvRowToModule(row: CSVRow, index: number): ProjectModule {
  const designDays = parseFloat(String(row['Design (days)']));
  const frontendDays = parseFloat(String(row['Front-end (days)']));
  const backendDays = parseFloat(String(row['Back-end (days)']));

  if (isNaN(designDays) || designDays < 0) {
    throw new ValidationError(
      `Row ${index + 1}: Design days must be a positive number. Got: ${row['Design (days)']}`
    );
  }

  if (isNaN(frontendDays) || frontendDays < 0) {
    throw new ValidationError(
      `Row ${index + 1}: Frontend days must be a positive number. Got: ${row['Front-end (days)']}`
    );
  }

  if (isNaN(backendDays) || backendDays < 0) {
    throw new ValidationError(
      `Row ${index + 1}: Backend days must be a positive number. Got: ${row['Back-end (days)']}`
    );
  }

  // Parse performers - split by comma and trim whitespace
  const designPerformers = row['Design Performers']
    ? row['Design Performers'].split(',').map((p) => p.trim()).filter(p => p.length > 0)
    : [];

  const developmentPerformers = row['Development Performers']
    ? row['Development Performers'].split(',').map((p) => p.trim()).filter(p => p.length > 0)
    : [];

  const module: ProjectModule = {
    id: `module-${index}`,
    name: row.Module.trim(),
    designDays,
    frontendDays,
    backendDays,
    designPerformers,
    developmentPerformers,
    isEnabled: true,
  };

  return validateProjectModule(module);
}

/**
 * Validate discount percentage
 */
export function validateDiscount(discount: number): number {
  if (typeof discount !== 'number' || isNaN(discount)) {
    throw new ValidationError('Discount must be a number');
  }

  if (discount < 0 || discount > 100) {
    throw new ValidationError('Discount must be between 0 and 100');
  }

  return discount;
}

/**
 * Validate timeline days
 */
export function validateTimeline(days: number, min: number, max: number): number {
  if (typeof days !== 'number' || isNaN(days)) {
    throw new ValidationError('Timeline must be a number');
  }

  if (days < min || days > max) {
    throw new ValidationError(
      `Timeline must be between ${min} and ${max} days. Got: ${days}`
    );
  }

  return Math.round(days);
}
