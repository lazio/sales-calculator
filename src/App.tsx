import { useState, useMemo } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import SidebarNav from '@/components/layout/SidebarNav';
import SidebarFooter from '@/components/layout/SidebarFooter';
import QuoteSummary from '@/components/quote/QuoteSummary';
import RateConfiguration from '@/components/rates/RateConfiguration';
import CSVImporter from '@/components/csv/CSVImporter';
import ModuleList from '@/components/features/ModuleList';
import WorkOverlapSlider from '@/components/overlap/WorkOverlapSlider';
import DiscountInput from '@/components/discount/DiscountInput';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { CSVImportErrorFallback, RateConfigErrorFallback, CalculationErrorFallback } from '@/components/common/ErrorFallback';
import { DEFAULT_RATES } from '@/types/rates.types';
import { ProjectModule } from '@/types/project.types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useQuoteCalculation } from '@/hooks/useQuoteCalculation';
import { useRateManagement } from '@/hooks/useRateManagement';
import { useModuleManagement } from '@/hooks/useModuleManagement';
import { extractUniquePerformers } from '@/utils/performers';

type Section = 'csv-import' | 'rates' | 'modules' | 'work-breakdown';

function App() {
  // Navigation state
  const [activeSection, setActiveSection] = useState<Section>('csv-import');

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
    setActiveSection('modules'); // Switch to modules view after import
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

  // Render content based on active section
  const renderMainContent = () => {
    switch (activeSection) {
      case 'csv-import':
        return (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">CSV Import</h2>
              <ErrorBoundary fallback={<CSVImportErrorFallback />}>
                <CSVImporter onImport={handleCSVImport} />
              </ErrorBoundary>
            </div>
          </div>
        );

      case 'rates':
        return (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Rate Configuration</h2>
              {modules.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Import a CSV file first to configure rates</p>
                </div>
              ) : (
                <ErrorBoundary fallback={<RateConfigErrorFallback />}>
                  <RateConfiguration
                    rates={visibleRates}
                    onRateChange={handleRateChange}
                    onRateDelete={handleRateDelete}
                    onDiscountChange={handlePerformerDiscountChange}
                    currency={currency}
                  />
                </ErrorBoundary>
              )}
            </div>
          </div>
        );

      case 'modules':
        return (
          <div className="max-w-6xl mx-auto">
            {modules.length > 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Project Modules</h2>
                <ModuleList
                  modules={modules}
                  onToggle={handleModuleToggle}
                  onBulkToggle={handleBulkToggle}
                  onAddModule={handleAddModule}
                  rates={rates}
                  overlapDays={workOverlap}
                  currency={currency}
                />

                {/* Overlap and Discount controls */}
                <div className="mt-6 space-y-4">
                  {hasBothDesignAndDevelopment && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Work Overlap</h3>
                      <WorkOverlapSlider
                        overlapDays={workOverlap}
                        maxOverlapDays={maxOverlapDays}
                        onOverlapChange={handleOverlapChange}
                      />
                    </div>
                  )}

                  {showDiscount && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Discount</h3>
                      <DiscountInput discount={discount} onDiscountChange={handleDiscountChange} />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                <p className="text-xl text-gray-500">Import a CSV file to get started</p>
                <p className="text-sm text-gray-400 mt-2">Use the CSV Import section to upload your project modules</p>
              </div>
            )}
          </div>
        );

      case 'work-breakdown':
        return (
          <div className="max-w-4xl mx-auto">
            {modules.length > 0 ? (
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
            ) : (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                <p className="text-xl text-gray-500">Import a CSV file to see the work breakdown</p>
                <p className="text-sm text-gray-400 mt-2">Use the CSV Import section to upload your project modules</p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AppLayout
      sidebarNav={
        <SidebarNav
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
      }
      sidebarFooter={
        <SidebarFooter
          modules={modules}
          rates={rates}
          totalQuote={quote.totalQuote}
          totalDays={quote.totalDays}
          designDays={quote.designDays}
          developmentDays={quote.developmentDays}
          designCost={quote.designCost}
          developmentCost={quote.developmentCost}
          discountAmount={quote.discountAmount}
          monthlyFee={quote.monthlyFee}
          currency={currency}
          onNavigateToCSVImport={() => setActiveSection('csv-import')}
        />
      }
      mainContent={renderMainContent()}
    />
  );
}

export default App
