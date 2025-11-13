import { ProjectModule } from '@/types/project.types';
import { RateConfig } from '@/types/rates.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Info, Palette, Code, Calendar, DollarSign } from 'lucide-react';

interface QuoteSummaryProps {
  totalQuote: number;
  monthlyFee: number;
  productPrice: number;
  totalDays: number;
  designDays?: number;
  developmentDays?: number;
  designCost?: number;
  developmentCost?: number;
  teamSizeMultiplier?: number;
  discountAmount?: number;
  finalTotal?: number;
  modules?: ProjectModule[];
  overlapDays?: number;
  onPriceClick?: () => void;
  currency?: '$' | '€';
  onCurrencyToggle?: () => void;
  rates?: RateConfig[];
}

export default function QuoteSummary({
  totalQuote,
  monthlyFee,
  totalDays,
  designDays = 0,
  developmentDays = 0,
  designCost = 0,
  developmentCost = 0,
  discountAmount = 0,
  finalTotal,
  modules = [],
  overlapDays = Infinity,
  onPriceClick,
  currency = '$',
  onCurrencyToggle,
  rates = []
}: QuoteSummaryProps) {
  const displayTotal = finalTotal !== undefined ? finalTotal : totalQuote;
  const roundedTotal = Math.round(displayTotal / 500) * 500;

  // Calculate rate discounts
  const ratesWithDiscounts = rates.filter(r => (r.discount || 0) > 0);
  const rateDiscountCount = ratesWithDiscounts.length;

  // Calculate what the quote would be without per-performer discounts
  const quoteWithoutRateDiscounts = rates.length > 0 ? (() => {
    // Calculate cost manually with all discounts set to 0
    const BUSINESS_DAYS_PER_MONTH = 20;
    const enabledModules = modules.filter(m => m.isEnabled);

    let fullCost = 0;
    for (const module of enabledModules) {
      // Design cost
      for (const performer of module.designPerformers) {
        const rate = rates.find(r => r.role === performer);
        if (rate) {
          fullCost += (rate.monthlyRate / BUSINESS_DAYS_PER_MONTH) * module.designDays;
        }
      }
      // Development cost
      const devDays = Math.max(module.frontendDays, module.backendDays);
      for (const performer of module.developmentPerformers) {
        const rate = rates.find(r => r.role === performer);
        if (rate) {
          fullCost += (rate.monthlyRate / BUSINESS_DAYS_PER_MONTH) * devDays;
        }
      }
    }
    return Math.round(fullCost);
  })() : totalQuote;

  const rateDiscountAmount = quoteWithoutRateDiscounts - totalQuote;
  const hasRateDiscounts = rateDiscountCount > 0 && rateDiscountAmount > 0;

  const enabledModules = modules.filter(m => m.isEnabled);

  // Calculate max possible overlap
  const totalDesign = enabledModules.reduce((sum, m) => sum + m.designDays, 0);
  const totalDev = enabledModules.reduce((sum, m) => sum + Math.max(m.frontendDays, m.backendDays), 0);
  const maxOverlap = Math.min(totalDesign, totalDev);

  // Determine overlap status
  const isFullyParallel = overlapDays >= maxOverlap;
  const isSequential = overlapDays === 0;
  const overlapWeeks = Math.floor(overlapDays / 5);


  return (
    <div className="space-y-4">
      {/* Work Breakdown */}
      {totalDays > 0 && (
        <Card>
          <CardHeader className="bg-muted/30">
            <div className="flex items-center justify-between">
              <CardTitle>Work Breakdown</CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Info className="h-4 w-4" />
                <span className="group relative cursor-help">
                  {isFullyParallel ? 'Fully parallel work' : isSequential ? 'Sequential work' : `${overlapWeeks}w overlap`}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Work Summary */}
            <div className="space-y-2">
              {designDays > 0 && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Design Effort
                  </span>
                  <Badge variant="secondary">{designDays} days</Badge>
                </div>
              )}

              {developmentDays > 0 && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    Development Effort
                  </span>
                  <Badge variant="secondary">{developmentDays} days</Badge>
                </div>
              )}
            </div>

            <Separator />

            {/* Total Timeline and Monthly Rate */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Total Project Timeline
                </div>
                <div className="text-2xl font-bold">{totalDays} days</div>
                <p className="text-xs text-muted-foreground">
                  {designDays + developmentDays} total effort days completed in {totalDays} calendar days due to parallel work
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  Monthly Rate Card
                </div>
                <div className="text-2xl font-bold">{currency}{monthlyFee.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Total monthly fee for all performers
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Price Breakdown */}
      {(designDays > 0 || developmentDays > 0) && (
        <div className={`grid gap-4 ${designDays > 0 && developmentDays > 0 ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {/* Design Phase */}
          {designDays > 0 && (
            <Card className="bg-muted/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Design Phase
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{currency}{designCost.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground mt-1">{designDays} days</p>
              </CardContent>
            </Card>
          )}

          {/* Development Phase */}
          {developmentDays > 0 && (
            <Card className="bg-muted/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Development Phase
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{currency}{developmentCost.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground mt-1">{developmentDays} days</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Total Quote Section */}
      <Card className="bg-muted/40">
        <CardHeader>
          <CardTitle>Total Quote</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Show discount breakdown if rate discounts or global discounts exist */}
          {(hasRateDiscounts || discountAmount > 0) && (
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Full price</span>
                <span>{currency}{quoteWithoutRateDiscounts.toLocaleString()}</span>
              </div>
              {hasRateDiscounts && (
                <div className="flex items-center justify-between text-sm text-green-600 dark:text-green-400">
                  <span className="flex items-center gap-1">
                    <span>Rate discounts</span>
                    <Badge variant="outline" className="ml-1">{rateDiscountCount}</Badge>
                  </span>
                  <span>-{currency}{rateDiscountAmount.toLocaleString()}</span>
                </div>
              )}
              {discountAmount > 0 && (
                <div className="flex items-center justify-between text-sm text-green-600 dark:text-green-400">
                  <span>Project discount</span>
                  <span>-{currency}{discountAmount.toLocaleString()}</span>
                </div>
              )}
              <Separator />
            </div>
          )}

          <div className="text-4xl font-bold flex items-center gap-1">
            <span>~</span>
            {onCurrencyToggle ? (
              <span
                onClick={onCurrencyToggle}
                className="cursor-pointer"
                title="Click to toggle currency"
              >
                {currency}
              </span>
            ) : (
              <span>{currency}</span>
            )}
            <span
              className={onPriceClick ? 'cursor-pointer' : ''}
              onClick={onPriceClick}
              title={onPriceClick && discountAmount === 0 ? 'Click to add discount' : undefined}
            >
              {roundedTotal.toLocaleString()}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
