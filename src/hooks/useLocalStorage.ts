import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing localStorage with React state
 * @param key - The localStorage key
 * @param defaultValue - Default value if key doesn't exist
 * @param validator - Optional function to validate parsed data
 * @returns [value, setValue, error] tuple
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
  validator?: (value: unknown) => value is T
): [T, (value: T | ((prev: T) => T)) => void, Error | null] {
  const [error, setError] = useState<Error | null>(null);

  // Initialize state from localStorage or use default
  const [value, setValue] = useState<T>(() => {
    try {
      // Check if localStorage is available (could be disabled in private browsing)
      if (typeof window === 'undefined' || !window.localStorage) {
        console.warn(`localStorage not available, using default value for ${key}`);
        return defaultValue;
      }

      const item = localStorage.getItem(key);
      if (!item) {
        return defaultValue;
      }

      const parsed = JSON.parse(item);

      // Validate the parsed data if validator is provided
      if (validator && !validator(parsed)) {
        const validationError = new Error(`Invalid data format in localStorage for key: ${key}`);
        setError(validationError);
        console.error(validationError.message, 'Using default value instead.');
        return defaultValue;
      }

      return parsed;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to parse localStorage');
      setError(error);
      console.error(`Error loading ${key} from localStorage:`, error);
      return defaultValue;
    }
  });

  // Save to localStorage whenever value changes
  useEffect(() => {
    try {
      // Check if localStorage is available
      if (typeof window === 'undefined' || !window.localStorage) {
        return;
      }

      const serialized = JSON.stringify(value);

      // Check storage size (warn if approaching 5MB limit)
      const estimatedSize = new Blob([serialized]).size;
      if (estimatedSize > 4500000) { // 4.5MB warning threshold
        console.warn(`localStorage for key "${key}" is approaching size limit: ${(estimatedSize / 1000000).toFixed(2)}MB`);
      }

      localStorage.setItem(key, serialized);
      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to save to localStorage');

      // Provide more specific error message for quota exceeded
      if (err instanceof Error && err.name === 'QuotaExceededError') {
        console.error(`localStorage quota exceeded for key "${key}". Consider clearing old data.`);
      }

      setError(error);
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  }, [key, value]);

  // Wrap setValue to support functional updates
  const setStoredValue = useCallback((newValue: T | ((prev: T) => T)) => {
    setValue(prevValue => {
      const valueToStore = typeof newValue === 'function' ? (newValue as (prev: T) => T)(prevValue) : newValue;
      return valueToStore;
    });
  }, []);

  return [value, setStoredValue, error];
}
