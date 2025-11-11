import { useState, useMemo } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import LeftPanel from '@/components/layout/LeftPanel';
import RightPanel from '@/components/layout/RightPanel';
import QuoteSummary from '@/components/quote/QuoteSummary';
import RateConfiguration from '@/components/rates/RateConfiguration';
import CSVImporter from '@/components/csv/CSVImporter';
import ModuleList from '@/components/features/ModuleList';
import WorkOverlapSlider from '@/components/overlap/WorkOverlapSlider';
import DiscountInput from '@/components/discount/DiscountInput';
import CollapsibleSection from '@/components/common/CollapsibleSection';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { CSVImportErrorFallback, RateConfigErrorFallback, CalculationErrorFallback } from '@/components/common/ErrorFallback';
import { DEFAULT_RATES } from '@/types/rates.types';
import { ProjectModule } from '@/types/project.types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useQuoteCalculation } from '@/hooks/useQuoteCalculation';
import { useRateManagement } from '@/hooks/useRateManagement';
import { useModuleManagement } from '@/hooks/useModuleManagement';
import { extractUniquePerformers } from '@/utils/performers';

function App() {
  // Use custom hooks for state management
  const { rates, updateRate, updateDiscount, deleteRate, addRates } = useRateManagement(DEFAULT_RATES);

  const { modules, toggleModule, bulkToggle, addModule, importModules } = useModuleManagement({
    onRatesAdded: addRates,
    existingRoles: rates.map(r => r.role)
  });

  // Work overlap (in days) - default: 1 month (20 business days) after design starts
  const [workOverlap, setWorkOverlap] = useState<number>(20);

  // Discount percentage (0-100)
  const [discount, setDiscount] = useState<number>(0);

  // Discount section visibility
  const [showDiscount, setShowDiscount] = useState<boolean>(false);

  // CSV section visibility
  const [csvSectionExpanded, setCsvSectionExpanded] = useState<boolean>(false);

  // Currency symbol ($ for USD, € for EUR) - persisted in localStorage
  const [currency, setCurrency] = useLocalStorage<'$' | '€'>('quote-calculator-currency', '$');

  // Filter rates to only show performers from the current CSV modules
  const visibleRates = useMemo(() => {
    if (modules.length === 0) {
      return [];
    }
    const performersInModules = extractUniquePerformers(modules);
    const performersSet = new Set(performersInModules);
    return rates.filter(rate => performersSet.has(rate.role));
  }, [modules, rates]);

  // Calculate max overlap based on enabled modules
  const maxOverlapDays = useMemo(() => {
    const enabledModules = modules.filter(m => m.isEnabled);
    if (enabledModules.length === 0) return 0;

    const totalDesign = enabledModules.reduce((sum, m) => sum + m.designDays, 0);
    const totalFrontend = enabledModules.reduce((sum, m) => sum + m.frontendDays, 0);
    const totalBackend = enabledModules.reduce((sum, m) => sum + m.backendDays, 0);
    const totalDev = Math.max(totalFrontend, totalBackend);

    return Math.min(totalDesign, totalDev);
  }, [modules]);

  // Check if there are both design and development services
  const hasBothDesignAndDevelopment = useMemo(() => {
    const enabledModules = modules.filter(m => m.isEnabled);
    if (enabledModules.length === 0) return false;

    const totalDesign = enabledModules.reduce((sum, m) => sum + m.designDays, 0);
    const totalFrontend = enabledModules.reduce((sum, m) => sum + m.frontendDays, 0);
    const totalBackend = enabledModules.reduce((sum, m) => sum + m.backendDays, 0);
    const totalDev = Math.max(totalFrontend, totalBackend);

    return totalDesign > 0 && totalDev > 0;
  }, [modules]);

  // Use custom hook for quote calculations
  const quote = useQuoteCalculation(
    rates,
    modules,
    discount,
    workOverlap
  );

  const handleRateChange = (index: number, newRate: number) => {
    // Get the role from visibleRates using the index
    const roleToUpdate = visibleRates[index]?.role;
    if (!roleToUpdate) return;

    updateRate(roleToUpdate, newRate);
  };

  const handleRateDelete = (index: number) => {
    // Get the role from visibleRates using the index
    const roleToDelete = visibleRates[index]?.role;
    if (!roleToDelete) return;

    deleteRate(roleToDelete);
  };

  const handlePerformerDiscountChange = (index: number, discount: number) => {
    // Get the role from visibleRates using the index
    const roleToUpdate = visibleRates[index]?.role;
    if (!roleToUpdate) return;

    updateDiscount(roleToUpdate, discount);
  };

  const handleCSVImport = (importedModules: ProjectModule[]) => {
    importModules(importedModules);
    setCsvSectionExpanded(false); // Collapse CSV section after successful import
  };

  const handleModuleToggle = (id: string) => {
    toggleModule(id);
  };

  const handleBulkToggle = (enabled: boolean) => {
    bulkToggle(enabled);
  };

  const handleAddModule = (moduleData: {
    name: string;
    designDays: number;
    frontendDays: number;
    backendDays: number;
    designPerformers: string[];
    developmentPerformers: string[];
  }) => {
    addModule(moduleData);
  };

  const handleDiscountChange = (discountPercentage: number) => {
    setDiscount(discountPercentage);
  };

  const handleOverlapChange = (days: number) => {
    setWorkOverlap(days);
  };

  const handlePriceClick = () => {
    setShowDiscount(true);
  };

  const handleCurrencyToggle = () => {
    setCurrency(currency === '$' ? '€' : '$');
  };

  return (
    <AppLayout
      leftPanel={
        <LeftPanel>
          <div className="space-y-4">
            {/* CSV Import */}
            <CollapsibleSection
              title="CSV Import"
              isExpanded={csvSectionExpanded}
              onToggle={setCsvSectionExpanded}
            >
              <ErrorBoundary fallback={<CSVImportErrorFallback />}>
                <CSVImporter onImport={handleCSVImport} />
              </ErrorBoundary>
            </CollapsibleSection>

            {/* Rate Configuration */}
            <CollapsibleSection title="Monthly Rates" defaultExpanded={false}>
              <ErrorBoundary fallback={<RateConfigErrorFallback />}>
                <RateConfiguration
                  rates={visibleRates}
                  onRateChange={handleRateChange}
                  onRateDelete={handleRateDelete}
                  onDiscountChange={handlePerformerDiscountChange}
                  currency={currency}
                />
              </ErrorBoundary>
            </CollapsibleSection>

            {/* Feature Toggles */}
            {modules.length > 0 && (
              <CollapsibleSection title="Project Modules" defaultExpanded={false}>
                <ModuleList
                  modules={modules}
                  onToggle={handleModuleToggle}
                  onBulkToggle={handleBulkToggle}
                  onAddModule={handleAddModule}
                  rates={rates}
                  overlapDays={workOverlap}
                  currency={currency}
                />
              </CollapsibleSection>
            )}

            {/* Work Overlap - only show when there are both design and development services */}
            {hasBothDesignAndDevelopment && (
              <CollapsibleSection title="Work Overlap" defaultExpanded={false}>
                <WorkOverlapSlider
                  overlapDays={workOverlap}
                  maxOverlapDays={maxOverlapDays}
                  onOverlapChange={handleOverlapChange}
                />
              </CollapsibleSection>
            )}

            {/* Discount */}
            {showDiscount && (
              <CollapsibleSection title="Discount" defaultExpanded={false}>
                <DiscountInput discount={discount} onDiscountChange={handleDiscountChange} />
              </CollapsibleSection>
            )}
          </div>
        </LeftPanel>
      }
      rightPanel={
        <RightPanel>
          <ErrorBoundary fallback={<CalculationErrorFallback />}>
            <QuoteSummary
              totalQuote={quote.totalQuote}
              monthlyFee={quote.monthlyFee}
              productPrice={quote.productPrice}
              totalDays={quote.totalDays}
              designDays={quote.designDays}
              developmentDays={quote.developmentDays}
              designCost={quote.designCost}
              developmentCost={quote.developmentCost}
              teamSizeMultiplier={quote.teamSizeMultiplier}
              discountAmount={quote.discountAmount}
              finalTotal={quote.finalTotal}
              modules={modules}
              overlapDays={workOverlap}
              onPriceClick={handlePriceClick}
              currency={currency}
              onCurrencyToggle={handleCurrencyToggle}
              rates={rates}
            />
          </ErrorBoundary>
        </RightPanel>
      }
    />
  )
}

export default App
