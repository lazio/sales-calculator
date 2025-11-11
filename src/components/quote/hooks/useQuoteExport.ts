import { useCallback } from 'react';
import { ProjectModule } from '@/types/project.types';
import { RateConfig } from '@/types/rates.types';

interface UseQuoteExportProps {
  roundedTotal: number;
  totalDays: number;
  designDays: number;
  developmentDays: number;
  designCost: number;
  developmentCost: number;
  discountAmount: number;
  hasRateDiscounts: boolean;
  rateDiscountAmount: number;
  enabledModules: ProjectModule[];
  currency: '$' | '€';
  rates: RateConfig[];
}

/**
 * Custom hook for exporting quote data in various formats
 */
export function useQuoteExport(props: UseQuoteExportProps) {
  const {
    roundedTotal,
    totalDays,
    designDays,
    developmentDays,
    designCost,
    developmentCost,
    discountAmount,
    hasRateDiscounts,
    rateDiscountAmount,
    enabledModules,
    currency,
    rates
  } = props;

  // Generate plain text export
  const generateTextExport = useCallback(() => {
    let text = `
PROJECT QUOTE SUMMARY
=====================

Total: ~${currency}${roundedTotal.toLocaleString()}

WORK BREAKDOWN
--------------
Total Working Days: ${totalDays} days
${designDays > 0 ? `  Design: ${designDays} days` : ''}
${developmentDays > 0 ? `  Development: ${developmentDays} days` : ''}

PRICE BREAKDOWN
---------------
${designDays > 0 ? `Design Cost: ${currency}${Math.round(designCost).toLocaleString()}` : ''}
${developmentDays > 0 ? `Development Cost: ${currency}${Math.round(developmentCost).toLocaleString()}` : ''}
`;

    if (hasRateDiscounts) {
      text += `\nPer-Performer Discounts: -${currency}${rateDiscountAmount.toLocaleString()}\n`;
    }

    if (discountAmount > 0) {
      text += `Project Discount: -${currency}${Math.round(discountAmount).toLocaleString()}\n`;
    }

    text += `\nTotal: ~${currency}${roundedTotal.toLocaleString()}\n`;

    // Add module details
    if (enabledModules.length > 0) {
      text += `\nMODULES\n-------\n`;
      enabledModules.forEach(module => {
        text += `\n${module.name}\n`;
        text += `  Design: ${module.designDays} days\n`;
        text += `  Frontend: ${module.frontendDays} days\n`;
        text += `  Backend: ${module.backendDays} days\n`;
      });
    }

    return text;
  }, [roundedTotal, totalDays, designDays, developmentDays, designCost, developmentCost,
      discountAmount, hasRateDiscounts, rateDiscountAmount, enabledModules, currency]);

  // Generate Markdown export
  const generateMarkdownExport = useCallback(() => {
    let markdown = `# Project Quote Summary\n\n`;
    markdown += `## Total: ~${currency}${roundedTotal.toLocaleString()}\n\n`;

    markdown += `## Work Breakdown\n\n`;
    markdown += `- **Total Working Days:** ${totalDays} days\n`;
    if (designDays > 0) markdown += `- **Design:** ${designDays} days\n`;
    if (developmentDays > 0) markdown += `- **Development:** ${developmentDays} days\n`;

    markdown += `\n## Price Breakdown\n\n`;
    if (designDays > 0) markdown += `- **Design Cost:** ${currency}${Math.round(designCost).toLocaleString()}\n`;
    if (developmentDays > 0) markdown += `- **Development Cost:** ${currency}${Math.round(developmentCost).toLocaleString()}\n`;

    if (hasRateDiscounts) {
      markdown += `- **Per-Performer Discounts:** -${currency}${rateDiscountAmount.toLocaleString()}\n`;
    }

    if (discountAmount > 0) {
      markdown += `- **Project Discount:** -${currency}${Math.round(discountAmount).toLocaleString()}\n`;
    }

    markdown += `\n**Total:** ~${currency}${roundedTotal.toLocaleString()}\n`;

    // Add module details
    if (enabledModules.length > 0) {
      markdown += `\n## Modules\n\n`;
      enabledModules.forEach(module => {
        markdown += `### ${module.name}\n\n`;
        markdown += `| Type | Days |\n`;
        markdown += `|------|------|\n`;
        markdown += `| Design | ${module.designDays} |\n`;
        markdown += `| Frontend | ${module.frontendDays} |\n`;
        markdown += `| Backend | ${module.backendDays} |\n\n`;
      });
    }

    return markdown;
  }, [roundedTotal, totalDays, designDays, developmentDays, designCost, developmentCost,
      discountAmount, hasRateDiscounts, rateDiscountAmount, enabledModules, currency]);

  // Generate JSON export
  const generateJSONExport = useCallback(() => {
    const data = {
      summary: {
        total: roundedTotal,
        currency,
        totalDays
      },
      workBreakdown: {
        designDays,
        developmentDays
      },
      priceBreakdown: {
        designCost: Math.round(designCost),
        developmentCost: Math.round(developmentCost),
        rateDiscounts: hasRateDiscounts ? rateDiscountAmount : 0,
        projectDiscount: Math.round(discountAmount),
        finalTotal: roundedTotal
      },
      modules: enabledModules.map(module => ({
        name: module.name,
        designDays: module.designDays,
        frontendDays: module.frontendDays,
        backendDays: module.backendDays,
        designPerformers: module.designPerformers,
        developmentPerformers: module.developmentPerformers
      })),
      rates: rates.map(rate => ({
        role: rate.role,
        monthlyRate: rate.monthlyRate,
        discount: rate.discount || 0
      }))
    };

    return JSON.stringify(data, null, 2);
  }, [roundedTotal, totalDays, designDays, developmentDays, designCost, developmentCost,
      discountAmount, hasRateDiscounts, rateDiscountAmount, enabledModules, currency, rates]);

  // Download a file
  const downloadFile = useCallback((content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  return {
    generateTextExport,
    generateMarkdownExport,
    generateJSONExport,
    downloadFile
  };
}
