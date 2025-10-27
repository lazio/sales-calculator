import { useState } from 'react';
import { ProjectModule } from '@/types/project.types';
import { RateConfig } from '@/types/rates.types';

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
  const [copied, setCopied] = useState(false);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

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
  const disabledModules = modules.filter(m => !m.isEnabled);

  // Calculate max possible overlap
  const totalDesign = enabledModules.reduce((sum, m) => sum + m.designDays, 0);
  const totalFrontend = enabledModules.reduce((sum, m) => sum + m.frontendDays, 0);
  const totalBackend = enabledModules.reduce((sum, m) => sum + m.backendDays, 0);
  const totalDev = Math.max(totalFrontend, totalBackend);
  const maxOverlap = Math.min(totalDesign, totalDev);

  // Determine overlap status
  const isFullyParallel = overlapDays >= maxOverlap;
  const isSequential = overlapDays === 0;
  const overlapWeeks = Math.floor(overlapDays / 5);

  const handleCopyToClipboard = async () => {
    const text = `
PROJECT QUOTE SUMMARY
=====================

Total: ~${currency}${roundedTotal.toLocaleString()}
${discountAmount > 0 ? `Original: ${currency}${totalQuote.toLocaleString()}\nDiscount: -${currency}${discountAmount.toLocaleString()}\n` : ''}
Timeline: ${totalDays} working days

WORK BREAKDOWN
--------------
Design Effort: ${designDays} days (${currency}${designCost.toLocaleString()})
Development Effort: ${developmentDays} days (${currency}${developmentCost.toLocaleString()})
Total Effort: ${designDays + developmentDays} days completed in ${totalDays} calendar days

TEAM RATES
----------
Monthly Rate Card: ${currency}${monthlyFee.toLocaleString()}

Generated with Project Quote Calculator
    `.trim();

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCopyMarkdownSimple = async () => {
    const markdown = `# Project Quote

## Timeline
- **Total Timeline:** ${totalDays} working days
- **Design Effort:** ${designDays} days
- **Development Effort:** ${developmentDays} days

## Modules

| Module | Design | Frontend | Backend | Timeline | Status |
|--------|--------|----------|---------|----------|--------|
${enabledModules.map(m =>
  `| ${m.name} | ${m.designDays}d | ${m.frontendDays}d | ${m.backendDays}d | ${Math.max(m.designDays, m.frontendDays, m.backendDays)}d | ✓ |`
).join('\n')}
${disabledModules.length > 0 ? disabledModules.map(m =>
  `| ~~${m.name}~~ | ${m.designDays}d | ${m.frontendDays}d | ${m.backendDays}d | ${Math.max(m.designDays, m.frontendDays, m.backendDays)}d | ✗ |`
).join('\n') : ''}

---
*Generated with Project Quote Calculator*
`;

    try {
      await navigator.clipboard.writeText(markdown);
      setCopiedMarkdown(true);
      setShowExportMenu(false);
      setTimeout(() => setCopiedMarkdown(false), 2000);
    } catch (err) {
      console.error('Failed to copy markdown:', err);
    }
  };

  const handleCopyMarkdownFull = async () => {
    const markdown = `# Project Quote Summary

## Budget Overview
- **Total Quote:** ~${currency}${roundedTotal.toLocaleString()}
${discountAmount > 0 ? `- **Original Price:** ${currency}${totalQuote.toLocaleString()}\n- **Discount:** -${currency}${discountAmount.toLocaleString()}\n` : ''}
- **Timeline:** ${totalDays} working days

## Work Breakdown
- **Design Phase:** ${designDays} days - ${currency}${designCost.toLocaleString()}
- **Development Phase:** ${developmentDays} days - ${currency}${developmentCost.toLocaleString()}
- **Total Effort:** ${designDays + developmentDays} days completed in ${totalDays} calendar days

## Team Rates
- **Monthly Rate Card:** ${currency}${monthlyFee.toLocaleString()}

## Module Details

| Module | Design | Frontend | Backend | Timeline | Design Team | Development Team | Status |
|--------|--------|----------|---------|----------|-------------|------------------|--------|
${enabledModules.map(m =>
  `| ${m.name} | ${m.designDays}d | ${m.frontendDays}d | ${m.backendDays}d | ${Math.max(m.designDays, m.frontendDays, m.backendDays)}d | ${m.designPerformers.join(', ') || 'N/A'} | ${m.developmentPerformers.join(', ') || 'N/A'} | ✓ |`
).join('\n')}
${disabledModules.length > 0 ? disabledModules.map(m =>
  `| ~~${m.name}~~ | ${m.designDays}d | ${m.frontendDays}d | ${m.backendDays}d | ${Math.max(m.designDays, m.frontendDays, m.backendDays)}d | ${m.designPerformers.join(', ') || 'N/A'} | ${m.developmentPerformers.join(', ') || 'N/A'} | ✗ |`
).join('\n') : ''}

---
*Generated with Project Quote Calculator*
`;

    try {
      await navigator.clipboard.writeText(markdown);
      setCopiedMarkdown(true);
      setShowExportMenu(false);
      setTimeout(() => setCopiedMarkdown(false), 2000);
    } catch (err) {
      console.error('Failed to copy markdown:', err);
    }
  };

  return (
    <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl shadow-xl p-8 animate-fade-in">
      {/* Work Breakdown */}
      {totalDays > 0 && (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-white">Work Breakdown</h3>
            <div className="flex items-center gap-2 text-sm text-white/80">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="group relative cursor-help">
                {isFullyParallel ? 'Fully parallel work' : isSequential ? 'Sequential work' : `${overlapWeeks}w overlap`}
                <span className="invisible group-hover:visible absolute left-0 top-6 w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-10">
                  {isFullyParallel
                    ? 'All modules work in parallel. Design and development happen simultaneously across all modules.'
                    : isSequential
                    ? 'Work is sequential. Development starts after design completes.'
                    : `Development starts ${overlapWeeks} week${overlapWeeks !== 1 ? 's' : ''} after design begins. All modules work in parallel.`}
                </span>
              </span>
            </div>
          </div>

          {/* Work Summary */}
          <div className="space-y-2">
            {designDays > 0 && (
              <div className="flex items-center justify-between text-white/90">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-purple-400"></span>
                  Design Effort
                </span>
                <span className="font-semibold">{designDays} days</span>
              </div>
            )}

            {developmentDays > 0 && (
              <div className="flex items-center justify-between text-white/90">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-400"></span>
                  Development Effort
                </span>
                <span className="font-semibold">{developmentDays} days</span>
              </div>
            )}
          </div>

          {/* Total Timeline and Monthly Rate */}
          <div className="pt-3 mt-3 border-t border-white/20 grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-white/90 text-sm">Total Project Timeline</span>
                <span className="text-white font-bold text-lg">{totalDays} days</span>
              </div>
              <p className="text-white/60 text-xs">
                {designDays + developmentDays} total effort days completed in {totalDays} calendar days due to parallel work
              </p>
            </div>
            <div className="border-l border-white/20 pl-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-white/90 text-sm">Monthly Rate Card</span>
                <span className="text-white font-bold text-lg">{currency}{monthlyFee.toLocaleString()}</span>
              </div>
              <p className="text-white/60 text-xs">
                Total monthly fee for all performers
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Price Breakdown */}
      {(designDays > 0 || developmentDays > 0) && (
        <div className="mb-8">
          <div className={`grid gap-4 ${designDays > 0 && developmentDays > 0 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {/* Design Phase */}
            {designDays > 0 && (
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-5">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-lg font-semibold text-white">Design Phase</h4>
                  <span className="text-2xl font-bold text-white">
                    {currency}{designCost.toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-white/80">{designDays} days</p>
              </div>
            )}

            {/* Development Phase */}
            {developmentDays > 0 && (
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-5">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-lg font-semibold text-white">Development Phase</h4>
                  <span className="text-2xl font-bold text-white">
                    {currency}{developmentCost.toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-white/80">{developmentDays} days</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Total Quote Section */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6 border border-white/20">
        <h2 className="text-base font-bold text-white mb-3">
          Total Quote
        </h2>

        {/* Show discount breakdown if rate discounts or global discounts exist */}
        {(hasRateDiscounts || discountAmount > 0) && (
          <div className="space-y-1 mb-3 text-sm">
            <div className="flex items-center justify-between text-white/80">
              <span>Full price</span>
              <span>{currency}{quoteWithoutRateDiscounts.toLocaleString()}</span>
            </div>
            {hasRateDiscounts && (
              <div className="flex items-center justify-between text-green-400">
                <span className="flex items-center gap-1">
                  <span>↓</span>
                  <span>Rate discounts</span>
                  <span className="text-xs text-green-300">({rateDiscountCount})</span>
                </span>
                <span>-{currency}{rateDiscountAmount.toLocaleString()}</span>
              </div>
            )}
            {discountAmount > 0 && (
              <div className="flex items-center justify-between text-green-400">
                <span className="flex items-center gap-1">
                  <span>↓</span>
                  <span>Project discount</span>
                </span>
                <span>-{currency}{discountAmount.toLocaleString()}</span>
              </div>
            )}
            <div className="border-t border-white/20 pt-1 mt-1"></div>
          </div>
        )}

        <div className="text-3xl font-bold text-white flex items-center gap-1">
          <span>~</span>
          {onCurrencyToggle ? (
            <span
              onClick={onCurrencyToggle}
              className="transition-colors cursor-pointer"
              title="Click to toggle currency"
            >
              {currency}
            </span>
          ) : (
            <span>{currency}</span>
          )}
          <span
            className={onPriceClick ? 'hover:text-white/90 transition-colors cursor-pointer' : ''}
            onClick={onPriceClick}
            title={onPriceClick && discountAmount === 0 ? 'Click to add discount' : undefined}
          >
            {roundedTotal.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Export Actions */}
      <div className="space-y-3">
        {/* Copy to Clipboard */}
        <button
          onClick={handleCopyToClipboard}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white text-primary-600 font-semibold rounded-lg hover:bg-white/90 transition-all duration-150"
        >
          {copied ? (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              Copy Summary
            </>
          )}
        </button>

        {/* Copy Markdown Dropdown */}
        {modules.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/20 text-white font-semibold rounded-lg hover:bg-white/30 transition-all duration-150 backdrop-blur-sm"
            >
              {copiedMarkdown ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Copy Markdown
                  <svg className={`w-4 h-4 transition-transform ${showExportMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </>
              )}
            </button>

            {showExportMenu && !copiedMarkdown && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg overflow-hidden z-10 animate-fade-in">
                <button
                  onClick={handleCopyMarkdownSimple}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100"
                >
                  <div className="font-semibold text-gray-800">Simple (No Prices)</div>
                  <div className="text-xs text-gray-600">Modules & timelines only</div>
                </button>
                <button
                  onClick={handleCopyMarkdownFull}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="font-semibold text-gray-800">Full Details</div>
                  <div className="text-xs text-gray-600">Modules, timelines, prices & budgets</div>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
