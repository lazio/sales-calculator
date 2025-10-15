import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing localStorage with React state
 * @param key - The localStorage key
 * @param defaultValue - Default value if key doesn't exist
 * @returns [value, setValue, error] tuple
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void, Error | null] {
  const [error, setError] = useState<Error | null>(null);

  // Initialize state from localStorage or use default
  const [value, setValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
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
      localStorage.setItem(key, JSON.stringify(value));
      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to save to localStorage');
      setError(error);
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  }, [key, value]);

  // Wrap setValue to support functional updates
  const setStoredValue = useCallback((newValue: T | ((prev: T) => T)) => {
    setValue(prevValue => {
      const valueToStore = newValue instanceof Function ? newValue(prevValue) : newValue;
      return valueToStore;
    });
  }, []);

  return [value, setStoredValue, error];
}
