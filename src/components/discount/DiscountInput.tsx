import { useState } from 'react';

interface DiscountInputProps {
  discount: number; // percentage (0-100)
  onDiscountChange: (discount: number) => void;
}

export default function DiscountInput({ discount, onDiscountChange }: DiscountInputProps) {
  const [inputValue, setInputValue] = useState(discount.toString());

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Parse and validate
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
      onDiscountChange(numValue);
    } else if (value === '' || value === '0') {
      onDiscountChange(0);
    }
  };

  const handleBlur = () => {
    // Reset to current discount if invalid
    setInputValue(discount.toString());
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Discount</h3>
        {discount > 0 && (
          <span className="text-sm font-medium text-green-600">
            {discount}% off applied
          </span>
        )}
      </div>

      <div className="relative">
        <input
          type="number"
          min="0"
          max="100"
          step="1"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          className="w-full px-4 py-3 pr-12 text-lg font-medium border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
          placeholder="0"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg font-medium text-gray-500">
          %
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[3, 5, 7].map((value) => (
          <button
            key={value}
            onClick={() => {
              setInputValue(value.toString());
              onDiscountChange(value);
            }}
            className={`py-2 px-3 text-sm font-medium rounded-lg transition-all ${
              discount === value
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {value}%
          </button>
        ))}
      </div>

      {discount > 0 && (
        <button
          onClick={() => {
            setInputValue('0');
            onDiscountChange(0);
          }}
          className="w-full py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
        >
          Clear Discount
        </button>
      )}

      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-start gap-2">
          <svg
            className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <p className="text-sm font-medium text-green-900">
              {discount === 0
                ? 'No discount applied'
                : `Discount reduces the total quote`}
            </p>
            <p className="text-xs text-green-800 mt-0.5">
              {discount === 0
                ? 'Use quick buttons or enter a custom percentage'
                : 'Applied to the final total quote amount'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
