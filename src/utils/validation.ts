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
    typeof obj.frontendDays === 'number' &&
    typeof obj.backendDays === 'number' &&
    Array.isArray(obj.performers) &&
    obj.performers.every((p) => typeof p === 'string') &&
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

  if (typeof obj['Front-end'] !== 'string' && typeof obj['Front-end'] !== 'number') {
    throw new ValidationError(`Row ${rowIndex + 1}: Missing or invalid 'Front-end' field`);
  }

  if (typeof obj['Back-end'] !== 'string' && typeof obj['Back-end'] !== 'number') {
    throw new ValidationError(`Row ${rowIndex + 1}: Missing or invalid 'Back-end' field`);
  }

  if (typeof obj.Performer !== 'string') {
    throw new ValidationError(`Row ${rowIndex + 1}: Missing or invalid 'Performer' field`);
  }

  return obj as unknown as CSVRow;
}

/**
 * Convert and validate CSV row to ProjectModule
 */
export function csvRowToModule(row: CSVRow, index: number): ProjectModule {
  const frontendDays = parseFloat(String(row['Front-end']));
  const backendDays = parseFloat(String(row['Back-end']));

  if (isNaN(frontendDays) || frontendDays < 0) {
    throw new ValidationError(
      `Row ${index + 1}: Frontend days must be a positive number. Got: ${row['Front-end']}`
    );
  }

  if (isNaN(backendDays) || backendDays < 0) {
    throw new ValidationError(
      `Row ${index + 1}: Backend days must be a positive number. Got: ${row['Back-end']}`
    );
  }

  const module: ProjectModule = {
    id: `module-${index}`,
    name: row.Module.trim(),
    frontendDays,
    backendDays,
    performers: row.Performer ? row.Performer.split(',').map((p) => p.trim()) : [],
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
