import { useState } from 'react';
import { ProjectModule } from '@/types/project.types';

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
  modules = []
}: QuoteSummaryProps) {
  const displayTotal = finalTotal !== undefined ? finalTotal : totalQuote;
  const [copied, setCopied] = useState(false);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const enabledModules = modules.filter(m => m.isEnabled);
  const disabledModules = modules.filter(m => !m.isEnabled);

  const handleCopyToClipboard = async () => {
    const text = `
PROJECT QUOTE SUMMARY
=====================

Total: $${displayTotal.toLocaleString()}
${discountAmount > 0 ? `Original: $${totalQuote.toLocaleString()}\nDiscount: -$${discountAmount.toLocaleString()}\n` : ''}
Timeline: ${totalDays} working days

WORK BREAKDOWN
--------------
Design Effort: ${designDays} days ($${designCost.toLocaleString()})
Development Effort: ${developmentDays} days ($${developmentCost.toLocaleString()})
Total Effort: ${designDays + developmentDays} days completed in ${totalDays} calendar days

TEAM RATES
----------
Monthly Rate Card: $${monthlyFee.toLocaleString()}

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
- **Total Quote:** $${displayTotal.toLocaleString()}
${discountAmount > 0 ? `- **Original Price:** $${totalQuote.toLocaleString()}\n- **Discount:** -$${discountAmount.toLocaleString()}\n` : ''}
- **Timeline:** ${totalDays} working days

## Work Breakdown
- **Design Phase:** ${designDays} days - $${designCost.toLocaleString()}
- **Development Phase:** ${developmentDays} days - $${developmentCost.toLocaleString()}
- **Total Effort:** ${designDays + developmentDays} days completed in ${totalDays} calendar days

## Team Rates
- **Monthly Rate Card:** $${monthlyFee.toLocaleString()}

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
      {/* Total Quote Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">
          {discountAmount > 0 ? 'Final Total' : 'Total Quote'}
        </h2>
        <div className="text-6xl font-bold text-white mb-2">
          ${displayTotal.toLocaleString()}
        </div>
        {discountAmount > 0 && (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-white/60 line-through text-xl">
              ${totalQuote.toLocaleString()}
            </span>
            <span className="px-2 py-1 bg-green-500 text-white text-sm font-semibold rounded">
              -${discountAmount.toLocaleString()} saved
            </span>
          </div>
        )}
        <p className="text-white/90 text-lg">
          {totalDays > 0 ? `${totalDays} working days timeline` : 'Your estimated total'}
        </p>
        {totalDays > 0 && (
          <p className="text-white/70 text-sm mt-1">
            Design and development work in parallel
          </p>
        )}
      </div>

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
                All work in parallel
                <span className="invisible group-hover:visible absolute left-0 top-6 w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-10">
                  All modules work in parallel. Design, frontend, and backend happen simultaneously across all modules.
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

          {/* Total Timeline */}
          <div className="pt-3 mt-3 border-t border-white/20">
            <div className="flex items-center justify-between mb-1">
              <span className="text-white/90 text-sm">Total Project Timeline</span>
              <span className="text-white font-bold text-lg">{totalDays} days</span>
            </div>
            <p className="text-white/60 text-xs">
              {designDays + developmentDays} total effort days completed in {totalDays} calendar days due to parallel work
            </p>
          </div>
        </div>
      )}

      {/* Price Breakdown */}
      <div className="space-y-4 mb-8">
        {/* Design Phase */}
        {designDays > 0 && (
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-5">
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-lg font-semibold text-white">Design Phase</h3>
              <span className="text-2xl font-bold text-white">
                ${designCost.toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-white/80">{designDays} days</p>
          </div>
        )}

        {/* Development Phase */}
        {developmentDays > 0 && (
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-5">
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-lg font-semibold text-white">Development Phase</h3>
              <span className="text-2xl font-bold text-white">
                ${developmentCost.toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-white/80">{developmentDays} days</p>
          </div>
        )}

        {/* Monthly Fee */}
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-5">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-lg font-semibold text-white">Monthly Rate Card</h3>
            <span className="text-2xl font-bold text-white">
              ${monthlyFee.toLocaleString()}
            </span>
          </div>
          <p className="text-sm text-white/80">Total monthly fee for all performers</p>
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
