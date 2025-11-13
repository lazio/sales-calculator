import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface DiscountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  discount: number;
  onDiscountChange: (discount: number) => void;
}

export default function DiscountModal({
  open,
  onOpenChange,
  discount,
  onDiscountChange,
}: DiscountModalProps) {
  const [inputValue, setInputValue] = useState(discount.toString());

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
      onDiscountChange(numValue);
    } else if (value === '' || value === '0') {
      onDiscountChange(0);
    }
  };

  const handleBlur = () => {
    setInputValue(discount.toString());
  };

  const handleQuickDiscount = (value: number) => {
    setInputValue(value.toString());
    onDiscountChange(value);
  };

  const handleClearDiscount = () => {
    setInputValue('0');
    onDiscountChange(0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Apply Discount</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {discount > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Current discount</span>
              <Badge variant="secondary">{discount}% off</Badge>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Discount Percentage</label>
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
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Quick Select</label>
            <div className="grid grid-cols-3 gap-2">
              {[3, 5, 7].map((value) => (
                <Button
                  key={value}
                  variant={discount === value ? "default" : "secondary"}
                  size="sm"
                  onClick={() => handleQuickDiscount(value)}
                >
                  {value}%
                </Button>
              ))}
            </div>
          </div>

          {discount > 0 && (
            <Button
              variant="outline"
              className="w-full text-destructive hover:text-destructive"
              onClick={handleClearDiscount}
            >
              Clear Discount
            </Button>
          )}

          <p className="text-xs text-muted-foreground">
            {discount === 0
              ? 'Use quick buttons or enter a custom percentage to apply a discount'
              : 'Discount is applied to the final total quote amount'}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
