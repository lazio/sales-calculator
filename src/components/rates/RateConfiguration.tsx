import { useState, useEffect } from 'react';
import { RateConfig } from '@/types/rates.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

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
    const stored = localStorage.getItem(EDITABLE_MODE_KEY);
    return stored !== null ? JSON.parse(stored) : false;
  });
  const [showDiscountForIndex, setShowDiscountForIndex] = useState<number | null>(null);
  const [localValues, setLocalValues] = useState<Record<number, string>>({});

  useEffect(() => {
    localStorage.setItem(EDITABLE_MODE_KEY, JSON.stringify(isEditable));
  }, [isEditable]);

  const handleDelete = (index: number) => {
    if (deleteConfirm === index) {
      onRateDelete?.(index);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(index);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  return (
    <div>
      <h3 onClick={() => setIsEditable(!isEditable)} className="mb-2">
        Monthly Rates
      </h3>

      {rates.length === 0 ? (
        <div className="border border-dashed rounded-lg p-6 text-center">
          <svg
            className="mx-auto text-muted-foreground"
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
          <p>No rates configured yet</p>
          <p className="text-muted-foreground">
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
            <Card key={rate.role} className="rounded-xl">
              <CardContent className="p-3">
                <div className="flex items-start gap-2">
                  <div className="block flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <Label>{rate.role}</Label>
                      <span className="text-muted-foreground">{currency}/month</span>
                    </div>

                    {isEditable ? (
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2">
                          {currency}
                        </span>
                        <Input
                          type="number"
                          min="0"
                          step="100"
                          value={localValues[index] !== undefined ? localValues[index] : rate.monthlyRate}
                          onChange={(e) => {
                            const value = e.target.value;
                            setLocalValues(prev => ({ ...prev, [index]: value }));
                          }}
                          onBlur={(e) => {
                            const value = e.target.value;
                            setLocalValues(prev => {
                              const newValues = { ...prev };
                              delete newValues[index];
                              return newValues;
                            });
                            onRateChange(index, value === '' ? 0 : Number(value));
                          }}
                          className="pl-8"
                          placeholder="8000"
                        />
                      </div>
                    ) : (
                      <div>
                        <div
                          onClick={() => setShowDiscountForIndex(showDiscount ? null : index)}
                          className="cursor-pointer"
                        >
                          {discount > 0 ? (
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="line-through text-muted-foreground">
                                {currency}{rate.monthlyRate.toLocaleString()}
                              </span>
                              <span className="text-muted-foreground">→</span>
                              <span className="font-semibold">
                                {currency}{effectiveRate.toLocaleString()}
                              </span>
                              <Badge variant="secondary">
                                {discount}% off
                              </Badge>
                            </div>
                          ) : (
                            <div className="font-semibold">
                              {currency}{rate.monthlyRate.toLocaleString()}
                            </div>
                          )}
                        </div>

                        {showDiscount && onDiscountChange && (
                          <div className="mt-2 pt-2 border-t">
                            <div className="flex items-center gap-2">
                              <Label>Discount</Label>
                              <Input
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
                                className="w-20"
                                placeholder="0"
                                autoFocus
                              />
                              <span>%</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {isEditable && onRateDelete && (
                    <Button
                      onClick={() => handleDelete(index)}
                      variant={deleteConfirm === index ? "destructive" : "ghost"}
                      size="icon"
                      title={deleteConfirm === index ? 'Click again to confirm' : 'Remove rate'}
                    >
                      {deleteConfirm === index ? (
                        <span>✓</span>
                      ) : (
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
        </div>
      )}
    </div>
  );
}
