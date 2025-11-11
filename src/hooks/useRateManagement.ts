import { useState, useMemo, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { RateConfig, STORAGE_KEY, isRateConfigArray } from '@/types/rates.types';

/**
 * Custom hook for managing rates with separate in-memory discounts
 * Rates (role and monthlyRate) are persisted to localStorage
 * Discounts are only kept in memory and reset on page reload
 */
export function useRateManagement(defaultRates: RateConfig[] = []) {
  // Use custom hook for localStorage management (rates without discounts)
  const [storedRates, setStoredRates] = useLocalStorage<RateConfig[]>(
    STORAGE_KEY,
    defaultRates,
    isRateConfigArray
  );

  // State for in-memory discounts (not persisted)
  const [rateDiscounts, setRateDiscounts] = useState<Record<string, number>>({});

  // Combine stored rates with in-memory discounts
  const rates = useMemo(() => {
    return storedRates.map(rate => ({
      ...rate,
      discount: rateDiscounts[rate.role] || 0
    }));
  }, [storedRates, rateDiscounts]);

  // Setter that strips discounts before saving
  const setRates = useCallback((newRates: RateConfig[] | ((prev: RateConfig[]) => RateConfig[])) => {
    const ratesToSave = typeof newRates === 'function'
      ? newRates(rates)
      : newRates;

    // Remove discount property before saving to localStorage
    const ratesWithoutDiscounts = ratesToSave.map(({ discount, ...rate }) => rate);
    setStoredRates(ratesWithoutDiscounts);
  }, [rates, setStoredRates]);

  // Update a specific rate's monthly rate
  const updateRate = useCallback((role: string, monthlyRate: number) => {
    setStoredRates(prev =>
      prev.map(r => r.role === role ? { ...r, monthlyRate } : r)
    );
  }, [setStoredRates]);

  // Update a specific rate's discount (in-memory only)
  const updateDiscount = useCallback((role: string, discount: number) => {
    setRateDiscounts(prev => ({
      ...prev,
      [role]: discount
    }));
  }, []);

  // Delete a rate and clean up its discount
  const deleteRate = useCallback((role: string) => {
    setStoredRates(prev => prev.filter(r => r.role !== role));

    // Clean up the discount state
    setRateDiscounts(prev => {
      const { [role]: _, ...rest } = prev;
      return rest;
    });
  }, [setStoredRates]);

  // Add new rates
  const addRates = useCallback((newRates: RateConfig[]) => {
    setStoredRates(prev => [...prev, ...newRates]);
  }, [setStoredRates]);

  return {
    rates,
    setRates,
    updateRate,
    updateDiscount,
    deleteRate,
    addRates
  };
}
