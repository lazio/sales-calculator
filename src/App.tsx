import { useState, useEffect, useMemo } from 'react';
import AppLayout from './components/layout/AppLayout';
import LeftPanel from './components/layout/LeftPanel';
import RightPanel from './components/layout/RightPanel';
import QuoteSummary from './components/quote/QuoteSummary';
import RateConfiguration from './components/rates/RateConfiguration';
import CSVImporter from './components/csv/CSVImporter';
import ModuleList from './components/features/ModuleList';
import TimelineSlider from './components/timeline/TimelineSlider';
import DiscountInput from './components/discount/DiscountInput';
import CollapsibleSection from './components/common/CollapsibleSection';
import { DEFAULT_RATES, RateConfig, STORAGE_KEY } from './types/rates.types';
import { ProjectModule } from './types/project.types';
import { calculateQuote } from './services/calculationEngine';

function App() {
  // Load rates from localStorage or use defaults
  const [rates, setRates] = useState<RateConfig[]>(() => {
    try {
      const savedRates = localStorage.getItem(STORAGE_KEY);
      return savedRates ? JSON.parse(savedRates) : DEFAULT_RATES;
    } catch (error) {
      console.error('Failed to load rates from localStorage:', error);
      return DEFAULT_RATES;
    }
  });

  // Project modules from CSV
  const [modules, setModules] = useState<ProjectModule[]>([]);

  // Timeline adjustment (null means use optimal timeline)
  const [customTimeline, setCustomTimeline] = useState<number | null>(null);

  // Discount percentage (0-100)
  const [discount, setDiscount] = useState<number>(0);

  // Save rates to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rates));
    } catch (error) {
      console.error('Failed to save rates to localStorage:', error);
    }
  }, [rates]);

  // Calculate optimal timeline (without custom timeline adjustment or discount)
  const optimalQuote = useMemo(() => calculateQuote(rates, modules), [rates, modules]);

  // Calculate timeline constraints
  const timelineConstraints = useMemo(() => {
    const optimalTimeline = optimalQuote.totalDays;
    const minTimeline = Math.max(1, Math.ceil(optimalTimeline * 0.5)); // Can't go below 50% of optimal
    const maxTimeline = Math.ceil(optimalTimeline * 2); // Can extend up to 200%

    // If customTimeline exists but is now outside the new range, clamp it
    let effectiveCustomTimeline = customTimeline;
    if (customTimeline !== null) {
      if (customTimeline < minTimeline) {
        effectiveCustomTimeline = minTimeline;
      } else if (customTimeline > maxTimeline) {
        effectiveCustomTimeline = maxTimeline;
      }
    }

    return {
      min: minTimeline,
      optimal: optimalTimeline,
      max: maxTimeline,
      current: effectiveCustomTimeline || optimalTimeline,
    };
  }, [optimalQuote.totalDays, customTimeline]);

  // Calculate final quote with custom timeline and discount
  const quote = useMemo(() => calculateQuote(rates, modules, customTimeline || undefined, discount), [rates, modules, customTimeline, discount]);

  const handleRateChange = (index: number, newRate: number) => {
    const updatedRates = [...rates];
    updatedRates[index] = { ...updatedRates[index], monthlyRate: newRate };
    setRates(updatedRates);
  };

  const handleCSVImport = (importedModules: ProjectModule[]) => {
    setModules(importedModules);
    setCustomTimeline(null); // Reset timeline when new modules are imported
  };

  const handleModuleToggle = (id: string) => {
    setModules(modules.map(m =>
      m.id === id ? { ...m, isEnabled: !m.isEnabled } : m
    ));
    // Don't reset customTimeline - let it recalculate which modules fit
  };

  const handleTimelineChange = (days: number) => {
    setCustomTimeline(days);
  };

  const handleDiscountChange = (discountPercentage: number) => {
    setDiscount(discountPercentage);
  };

  return (
    <AppLayout
      leftPanel={
        <LeftPanel>
          <div className="space-y-4">
            {/* CSV Import */}
            <CollapsibleSection title="CSV Import" defaultExpanded={true}>
              <CSVImporter onImport={handleCSVImport} />
            </CollapsibleSection>

            {/* Rate Configuration */}
            <CollapsibleSection title="Monthly Rates" defaultExpanded={true}>
              <RateConfiguration rates={rates} onRateChange={handleRateChange} />
            </CollapsibleSection>

            {/* Feature Toggles */}
            {modules.length > 0 && (
              <CollapsibleSection title="Project Modules" defaultExpanded={true}>
                <ModuleList
                  modules={modules}
                  onToggle={handleModuleToggle}
                  modulesInTimeline={quote.modulesInTimeline}
                  rates={rates}
                />
              </CollapsibleSection>
            )}

            {/* Timeline Adjustment */}
            <CollapsibleSection title="Timeline Adjustment" defaultExpanded={true}>
              <TimelineSlider
                minDays={timelineConstraints.min}
                maxDays={timelineConstraints.max}
                currentDays={timelineConstraints.current}
                optimalDays={timelineConstraints.optimal}
                onTimelineChange={handleTimelineChange}
              />
            </CollapsibleSection>

            {/* Discount */}
            <CollapsibleSection title="Discount" defaultExpanded={true}>
              <DiscountInput discount={discount} onDiscountChange={handleDiscountChange} />
            </CollapsibleSection>
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
            teamSizeMultiplier={quote.teamSizeMultiplier}
            discountAmount={quote.discountAmount}
            finalTotal={quote.finalTotal}
          />
        </RightPanel>
      }
    />
  )
}

export default App
