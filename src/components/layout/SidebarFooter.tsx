import { useState } from 'react';
import { ProjectModule } from '@/types/project.types';
import { RateConfig } from '@/types/rates.types';

interface SidebarFooterProps {
  modules: ProjectModule[];
  rates: RateConfig[];
  totalQuote: number;
  totalDays: number;
  designDays: number;
  developmentDays: number;
  designCost: number;
  developmentCost: number;
  discountAmount: number;
  monthlyFee: number;
  currency: '$' | '€';
}

export default function SidebarFooter({
  modules,
  rates,
  totalQuote,
  totalDays,
  designDays,
  developmentDays,
  designCost,
  developmentCost,
  discountAmount,
  monthlyFee,
  currency,
}: SidebarFooterProps) {
  const [copied, setCopied] = useState(false);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);
  const [showMarkdownMenu, setShowMarkdownMenu] = useState(false);

  const enabledModules = modules.filter(m => m.isEnabled);
  const disabledModules = modules.filter(m => !m.isEnabled);
  const roundedTotal = Math.round((totalQuote - discountAmount) / 500) * 500;

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
      setShowMarkdownMenu(false);
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
      setShowMarkdownMenu(false);
      setTimeout(() => setCopiedMarkdown(false), 2000);
    } catch (err) {
      console.error('Failed to copy markdown:', err);
    }
  };

  const handleSaveCalculations = () => {
    const BUSINESS_DAYS_PER_MONTH = 20;

    // Calculate rate discounts
    const ratesWithDiscounts = rates.filter(r => (r.discount || 0) > 0);
    const hasRateDiscounts = ratesWithDiscounts.length > 0;

    // Calculate quote without rate discounts
    let quoteWithoutRateDiscounts = totalQuote;
    let rateDiscountAmount = 0;
    if (hasRateDiscounts) {
      rateDiscountAmount = rates.reduce((sum, rate) => {
        const discount = rate.discount || 0;
        if (discount === 0) return sum;
        const dailyRate = rate.monthlyRate / BUSINESS_DAYS_PER_MONTH;
        const discountPerDay = dailyRate * (discount / 100);
        // Calculate total days this performer works (simplified)
        const performerDays = enabledModules.reduce((days, m) => {
          if (m.designPerformers.includes(rate.role)) days += m.designDays;
          if (m.developmentPerformers.includes(rate.role)) days += Math.max(m.frontendDays, m.backendDays);
          return days;
        }, 0);
        return sum + (discountPerDay * performerDays);
      }, 0);
      quoteWithoutRateDiscounts = totalQuote + rateDiscountAmount;
    }

    // Build detailed calculations
    const moduleCalculations = enabledModules.map(module => {
      const designPerformerDetails = module.designPerformers.map(performer => {
        const rate = rates.find(r => r.role === performer);
        const monthlyRate = rate?.monthlyRate || 0;
        const dailyRate = monthlyRate / BUSINESS_DAYS_PER_MONTH;
        const discount = rate?.discount || 0;
        const discountedDailyRate = dailyRate * (1 - discount / 100);
        const cost = discountedDailyRate * module.designDays;

        return {
          performer,
          monthlyRate,
          dailyRate: Math.round(dailyRate * 100) / 100,
          discount: discount > 0 ? `${discount}%` : 'None',
          discountedDailyRate: Math.round(discountedDailyRate * 100) / 100,
          days: module.designDays,
          cost: Math.round(cost * 100) / 100,
          calculation: `${monthlyRate} / ${BUSINESS_DAYS_PER_MONTH} = ${Math.round(dailyRate * 100) / 100} per day${discount > 0 ? ` * ${1 - discount / 100} (discount)` : ''} * ${module.designDays} days = ${Math.round(cost * 100) / 100}`
        };
      });

      const maxDevDays = Math.max(module.frontendDays, module.backendDays);
      const developmentPerformerDetails = module.developmentPerformers.map(performer => {
        const rate = rates.find(r => r.role === performer);
        const monthlyRate = rate?.monthlyRate || 0;
        const dailyRate = monthlyRate / BUSINESS_DAYS_PER_MONTH;
        const discount = rate?.discount || 0;
        const discountedDailyRate = dailyRate * (1 - discount / 100);

        // Determine performer type to calculate correct days
        const performerName = performer.toLowerCase();
        let devDays: number;
        let performerType: string;

        if (performerName.includes('front-end') || performerName.includes('frontend') ||
            performerName.match(/\bfe\b/) || performerName.match(/\bfront\b/)) {
          devDays = module.frontendDays;
          performerType = 'frontend';
        } else if (performerName.includes('back-end') || performerName.includes('backend') ||
                   performerName.match(/\bbe\b/) || performerName.match(/\bback\b/)) {
          devDays = module.backendDays;
          performerType = 'backend';
        } else {
          // QA, PM, and other roles work for the full development duration
          devDays = maxDevDays;
          performerType = 'other';
        }

        const cost = discountedDailyRate * devDays;

        return {
          performer,
          monthlyRate,
          dailyRate: Math.round(dailyRate * 100) / 100,
          discount: discount > 0 ? `${discount}%` : 'None',
          discountedDailyRate: Math.round(discountedDailyRate * 100) / 100,
          days: devDays,
          note: performerType === 'frontend' ? `Frontend developer works ${module.frontendDays}d` :
                performerType === 'backend' ? `Backend developer works ${module.backendDays}d` :
                `Max of frontend (${module.frontendDays}d) and backend (${module.backendDays}d)`,
          cost: Math.round(cost * 100) / 100,
          calculation: `${monthlyRate} / ${BUSINESS_DAYS_PER_MONTH} = ${Math.round(dailyRate * 100) / 100} per day${discount > 0 ? ` * ${1 - discount / 100} (discount)` : ''} * ${devDays} days = ${Math.round(cost * 100) / 100}`
        };
      });

      const moduleTotalCost = [
        ...designPerformerDetails,
        ...developmentPerformerDetails
      ].reduce((sum, p) => sum + p.cost, 0);

      return {
        name: module.name,
        isEnabled: module.isEnabled,
        effort: {
          design: module.designDays,
          frontend: module.frontendDays,
          backend: module.backendDays,
          developmentDaysUsed: devDays
        },
        designCalculations: designPerformerDetails,
        developmentCalculations: developmentPerformerDetails,
        moduleTotalCost: Math.round(moduleTotalCost * 100) / 100
      };
    });

    const calculations = {
      timestamp: new Date().toISOString(),
      currency,
      summary: {
        totalQuote: Math.round(totalQuote * 100) / 100,
        roundedTotal,
        discountAmount: Math.round(discountAmount * 100) / 100,
        finalTotal: Math.round((totalQuote - discountAmount) * 100) / 100,
        timeline: {
          totalDays,
          designDays,
          developmentDays,
          overlapDays: 'Calculated based on project',
          totalEffortDays: designDays + developmentDays
        }
      },
      rates: rates.map(r => ({
        role: r.role,
        monthlyRate: r.monthlyRate,
        dailyRate: Math.round((r.monthlyRate / BUSINESS_DAYS_PER_MONTH) * 100) / 100,
        discount: r.discount || 0,
        discountedDailyRate: Math.round((r.monthlyRate / BUSINESS_DAYS_PER_MONTH) * (1 - (r.discount || 0) / 100) * 100) / 100
      })),
      discounts: {
        perPerformerDiscounts: ratesWithDiscounts.map(r => ({
          role: r.role,
          discount: `${r.discount}%`,
          savings: Math.round((r.monthlyRate / BUSINESS_DAYS_PER_MONTH) * (r.discount || 0) / 100 * 100) / 100 + ' per day'
        })),
        totalRateDiscountAmount: hasRateDiscounts ? Math.round(rateDiscountAmount * 100) / 100 : 0,
        projectDiscountAmount: Math.round(discountAmount * 100) / 100,
        totalDiscounts: hasRateDiscounts ? Math.round((rateDiscountAmount + discountAmount) * 100) / 100 : Math.round(discountAmount * 100) / 100
      },
      costs: {
        designCost: Math.round(designCost * 100) / 100,
        developmentCost: Math.round(developmentCost * 100) / 100,
        totalBeforeDiscounts: hasRateDiscounts ? Math.round(quoteWithoutRateDiscounts * 100) / 100 : Math.round(totalQuote * 100) / 100,
        afterRateDiscounts: Math.round(totalQuote * 100) / 100,
        afterProjectDiscount: Math.round((totalQuote - discountAmount) * 100) / 100
      },
      modules: moduleCalculations,
      disabledModules: disabledModules.map(m => ({
        name: m.name,
        effort: {
          design: m.designDays,
          frontend: m.frontendDays,
          backend: m.backendDays
        }
      }))
    };

    // Create and download file
    const blob = new Blob([JSON.stringify(calculations, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quote-calculations-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setShowMarkdownMenu(false);
  };

  if (modules.length === 0) {
    return null;
  }

  return (
    <div className="border-t border-gray-200 p-3 bg-gray-50">
      <div className="space-y-2">
        {/* Copy Summary Button */}
        <button
          onClick={handleCopyToClipboard}
          className="w-full text-xs py-2 px-3 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors flex items-center justify-center space-x-1.5"
        >
          <span>{copied ? '✓' : '📋'}</span>
          <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
        </button>

        {/* Copy Markdown Button with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowMarkdownMenu(!showMarkdownMenu)}
            className="w-full text-xs py-2 px-3 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors flex items-center justify-center space-x-1.5"
          >
            <span>{copiedMarkdown ? '✓' : '📝'}</span>
            <span>{copiedMarkdown ? 'Copied!' : 'Copy Markdown'}</span>
            <span className="text-xs">▼</span>
          </button>

          {showMarkdownMenu && (
            <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-gray-300 rounded shadow-lg overflow-hidden">
              <button
                onClick={handleCopyMarkdownSimple}
                className="w-full text-left text-xs py-2 px-3 hover:bg-gray-50 text-gray-700"
              >
                Simple (modules only)
              </button>
              <button
                onClick={handleCopyMarkdownFull}
                className="w-full text-left text-xs py-2 px-3 hover:bg-gray-50 text-gray-700 border-t border-gray-200"
              >
                Full (with pricing)
              </button>
              <button
                onClick={handleSaveCalculations}
                className="w-full text-left text-xs py-2 px-3 hover:bg-gray-50 text-gray-700 border-t border-gray-200 flex items-center space-x-1.5"
              >
                <span>💾</span>
                <span>Save All Calculations</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
