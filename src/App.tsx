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
import { DEFAULT_RATES, RateConfig, STORAGE_KEY } from '@/types/rates.types';
import { ProjectModule } from '@/types/project.types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useQuoteCalculation } from '@/hooks/useQuoteCalculation';
import { getMissingPerformers, extractUniquePerformers } from '@/utils/performers';

function App() {
  // Use custom hook for localStorage management
  const [rates, setRates] = useLocalStorage<RateConfig[]>(STORAGE_KEY, DEFAULT_RATES);

  // Project modules from CSV
  const [modules, setModules] = useState<ProjectModule[]>([]);

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

    // Find and update the rate in the full rates array
    const updatedRates = rates.map(rate =>
      rate.role === roleToUpdate
        ? { ...rate, monthlyRate: newRate }
        : rate
    );
    setRates(updatedRates);
  };

  const handleRateDelete = (index: number) => {
    // Get the role from visibleRates using the index
    const roleToDelete = visibleRates[index]?.role;
    if (!roleToDelete) return;

    // Remove the rate from the full rates array
    const updatedRates = rates.filter(rate => rate.role !== roleToDelete);
    setRates(updatedRates);
  };

  const handlePerformerDiscountChange = (index: number, discount: number) => {
    // Get the role from visibleRates using the index
    const roleToUpdate = visibleRates[index]?.role;
    if (!roleToUpdate) return;

    // Find and update the discount in the full rates array
    const updatedRates = rates.map(rate =>
      rate.role === roleToUpdate
        ? { ...rate, discount }
        : rate
    );
    setRates(updatedRates);
  };

  const handleCSVImport = (importedModules: ProjectModule[]) => {
    setModules(importedModules);
    setCsvSectionExpanded(false); // Collapse CSV section after successful import

    // Add missing performers to rates with default rate
    const missingPerformers = getMissingPerformers(importedModules, rates.map(r => r.role));

    if (missingPerformers.length > 0) {
      const newRates: RateConfig[] = missingPerformers.map(role => ({
        role,
        monthlyRate: 1000, // Default rate
      }));
      setRates([...rates, ...newRates]);
    }
  };

  const handleModuleToggle = (id: string) => {
    setModules(modules.map(m =>
      m.id === id ? { ...m, isEnabled: !m.isEnabled } : m
    ));
  };

  const handleBulkToggle = (enabled: boolean) => {
    setModules(modules.map(m => ({ ...m, isEnabled: enabled })));
  };

  const handleAddModule = (moduleData: {
    name: string;
    designDays: number;
    frontendDays: number;
    backendDays: number;
    designPerformers: string[];
    developmentPerformers: string[];
  }) => {
    // Generate unique ID using timestamp
    const id = `module-${Date.now()}`;

    // Create new module
    const newModule: ProjectModule = {
      id,
      name: moduleData.name,
      designDays: moduleData.designDays,
      frontendDays: moduleData.frontendDays,
      backendDays: moduleData.backendDays,
      designPerformers: moduleData.designPerformers,
      developmentPerformers: moduleData.developmentPerformers,
      isEnabled: true, // Enabled by default
    };

    // Add to modules array at the top
    setModules([newModule, ...modules]);

    // Auto-create missing performers (like CSV import does)
    const missingPerformers = getMissingPerformers(
      [newModule],
      rates.map(r => r.role)
    );

    if (missingPerformers.length > 0) {
      const newRates: RateConfig[] = missingPerformers.map(role => ({
        role,
        monthlyRate: 1000, // Default rate
      }));
      setRates([...rates, ...newRates]);
    }
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
              <CSVImporter onImport={handleCSVImport} />
            </CollapsibleSection>

            {/* Rate Configuration */}
            <CollapsibleSection title="Monthly Rates" defaultExpanded={false}>
              <RateConfiguration
                rates={visibleRates}
                onRateChange={handleRateChange}
                onRateDelete={handleRateDelete}
                onDiscountChange={handlePerformerDiscountChange}
                currency={currency}
              />
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
        </RightPanel>
      }
    />
  )
}

export default App
