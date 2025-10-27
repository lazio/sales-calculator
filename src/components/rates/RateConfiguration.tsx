import { useState, useEffect } from 'react';
import { RateConfig } from '@/types/rates.types';

interface RateConfigurationProps {
  rates: RateConfig[];
  onRateChange: (index: number, newRate: number) => void;
  onRateDelete?: (index: number) => void;
  onDiscountChange?: (index: number, discount: number) => void;
  currency?: '$' | '€';
}

const EDITABLE_MODE_KEY = 'quote-calculator-rates-editable';

export default function RateConfiguration({
  rates,
  onRateChange,
  onRateDelete,
  onDiscountChange,
  currency = '$'
}: RateConfigurationProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [isEditable, setIsEditable] = useState<boolean>(() => {
    // Load from localStorage, default to false (locked)
    const stored = localStorage.getItem(EDITABLE_MODE_KEY);
    return stored !== null ? JSON.parse(stored) : false;
  });
  const [showDiscountForIndex, setShowDiscountForIndex] = useState<number | null>(null);

  // Persist editable mode to localStorage
  useEffect(() => {
    localStorage.setItem(EDITABLE_MODE_KEY, JSON.stringify(isEditable));
  }, [isEditable]);

  const handleDelete = (index: number) => {
    if (deleteConfirm === index) {
      onRateDelete?.(index);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(index);
      // Auto-cancel after 3 seconds
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };
  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h3
          onClick={() => setIsEditable(!isEditable)}
          className="text-lg font-semibold text-gray-800 mb-2 cursor-pointer hover:text-gray-600 transition-colors"
          title={isEditable ? 'Click to lock rates (enable discounts)' : 'Click to unlock rates (enable editing)'}
        >
          Monthly Rates
        </h3>
        <p className="text-sm text-gray-600">
          {isEditable
            ? 'Configure the monthly rates for each team role'
            : 'Apply percentage discounts to performer rates'}
        </p>
      </div>

      {rates.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-gray-600 font-medium mb-1">No rates configured yet</p>
          <p className="text-sm text-gray-500">
            Upload a CSV file to automatically populate rates for all performers
          </p>
        </div>
      ) : (
        <div className="space-y-2">
        {rates.map((rate, index) => {
          const discount = rate.discount || 0;
          const effectiveRate = Math.round(rate.monthlyRate * (1 - discount / 100));
          const showDiscount = showDiscountForIndex === index;

          return (
            <div
              key={rate.role}
              className={`rounded-lg p-3 transition-colors duration-150 ${
                isEditable ? 'bg-gray-50 hover:bg-gray-100' : 'bg-blue-50 border border-blue-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="block flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-700">{rate.role}</span>
                    <span className="text-sm text-gray-500">{currency}/month</span>
                  </div>

                  {/* Monthly Rate - Editable Mode: Input, Locked Mode: Clickable Text */}
                  {isEditable ? (
                    <div className="relative mb-2">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 font-semibold">
                        {currency}
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="100"
                        value={rate.monthlyRate || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          onRateChange(index, value === '' ? 0 : Number(value));
                        }}
                        className="w-full pl-8 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-150 outline-none font-semibold text-gray-900 bg-white"
                        placeholder="8000"
                      />
                    </div>
                  ) : (
                    <div className="mb-2">
                      <div
                        onClick={() => setShowDiscountForIndex(showDiscount ? null : index)}
                        className="cursor-pointer"
                      >
                        {discount > 0 ? (
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-gray-500 line-through">
                              {currency}{rate.monthlyRate.toLocaleString()}
                            </span>
                            <span className="text-gray-400">→</span>
                            <span className="font-semibold text-gray-900">
                              {currency}{effectiveRate.toLocaleString()}
                            </span>
                            <span className="text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded">
                              {discount}% off
                            </span>
                          </div>
                        ) : (
                          <div className="font-semibold text-gray-900">
                            {currency}{rate.monthlyRate.toLocaleString()}
                          </div>
                        )}
                      </div>

                      {/* Discount Input (only when price is clicked) */}
                      {showDiscount && onDiscountChange && (
                        <div className="mt-2 animate-fade-in">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Discount</span>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="1"
                              value={discount || ''}
                              onChange={(e) => {
                                const value = e.target.value;
                                const numValue = value === '' ? 0 : Math.min(100, Math.max(0, Number(value)));
                                onDiscountChange(index, numValue);
                              }}
                              className="w-20 px-2 py-1 text-sm border-2 border-blue-300 rounded focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none font-semibold text-gray-900 bg-white"
                              placeholder="0"
                              autoFocus
                            />
                            <span className="text-sm text-gray-600">%</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Delete Button (only in editable mode) */}
                {isEditable && onRateDelete && (
                  <button
                    onClick={() => handleDelete(index)}
                    className={`mt-6 p-1.5 rounded-lg transition-all duration-150 ${
                      deleteConfirm === index
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'text-red-600 hover:bg-red-50'
                    }`}
                    title={deleteConfirm === index ? 'Click again to confirm' : 'Remove rate'}
                  >
                    {deleteConfirm === index ? (
                      <span className="text-xs font-medium px-1">Confirm?</span>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
        </div>
      )}

      {rates.length > 0 && (
        <div className="mt-4 p-4 bg-primary-50 rounded-lg border border-primary-200">
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-primary-900">Auto-saved:</p>
              <p className="text-sm text-primary-700">
                Your rates are automatically saved to local storage
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
