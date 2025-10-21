import { useState } from 'react';
import { RateConfig } from '@/types/rates.types';

interface RateConfigurationProps {
  rates: RateConfig[];
  onRateChange: (index: number, newRate: number) => void;
  onRateDelete?: (index: number) => void;
  currency?: '$' | '€';
}

export default function RateConfiguration({ rates, onRateChange, onRateDelete, currency = '$' }: RateConfigurationProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

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
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Monthly Rates</h3>
        <p className="text-sm text-gray-600">Configure the monthly rates for each team role</p>
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
        <div className="space-y-3">
        {rates.map((rate, index) => (
          <div
            key={rate.role}
            className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-150"
          >
            <div className="flex items-start gap-3">
              <label className="block flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-700">{rate.role}</span>
                  <span className="text-sm text-gray-500">{currency}/month</span>
                </div>
                <div className="relative">
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
                    className="w-full pl-8 pr-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-150 outline-none font-semibold text-gray-900"
                    placeholder="8000"
                  />
                </div>
              </label>
              {onRateDelete && (
                <button
                  onClick={() => handleDelete(index)}
                  className={`mt-8 p-2 rounded-lg transition-all duration-150 ${
                    deleteConfirm === index
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'text-red-600 hover:bg-red-50'
                  }`}
                  title={deleteConfirm === index ? 'Click again to confirm' : 'Remove rate'}
                >
                  {deleteConfirm === index ? (
                    <span className="text-xs font-medium px-1">Confirm?</span>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
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
