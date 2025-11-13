import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
    <div>
      <div className="flex items-center justify-between">
        <h3>Discount</h3>
        {discount > 0 && (
          <span>
            {discount}% off applied
          </span>
        )}
      </div>

      <div className="relative">
        <Input
          type="number"
          min="0"
          max="100"
          step="1"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          placeholder="0"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
          %
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[3, 5, 7].map((value) => (
          <Button
            key={value}
            variant={discount === value ? "default" : "secondary"}
            size="sm"
            onClick={() => {
              setInputValue(value.toString());
              onDiscountChange(value);
            }}
          >
            {value}%
          </Button>
        ))}
      </div>

      {discount > 0 && (
        <Button
          variant="ghost"
          className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => {
            setInputValue('0');
            onDiscountChange(0);
          }}
        >
          Clear Discount
        </Button>
      )}

      <div className="border rounded-lg p-3">
        <div className="flex items-start gap-2">
          <svg
            className="flex-shrink-0"
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
            <p>
              {discount === 0
                ? 'No discount applied'
                : `Discount reduces the total quote`}
            </p>
            <p className="text-muted-foreground">
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
