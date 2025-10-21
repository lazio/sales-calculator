import { useState, useMemo } from 'react';
import { ProjectModule } from '@/types/project.types';
import { RateConfig } from '@/types/rates.types';
import { calculateModuleStats, calculateModulePrice } from '@/services/calculationEngine';

interface ModuleListProps {
  modules: ProjectModule[];
  onToggle: (id: string) => void;
  onBulkToggle?: (enabled: boolean) => void;
  modulesInTimeline?: string[]; // IDs of modules that fit in the timeline
  rates: RateConfig[];
  overlapDays?: number;
}

type SortOption = 'name' | 'price' | 'timeline';

export default function ModuleList({ modules, onToggle, onBulkToggle, modulesInTimeline, rates, overlapDays = Infinity }: ModuleListProps) {
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [sortDesc, setSortDesc] = useState(false);

  if (modules.length === 0) {
    return null;
  }

  // Calculate statistics using centralized business logic
  const { timelineDays, effortDays } = calculateModuleStats(modules, overlapDays);

  // Calculate total cost for percentage display
  const totalCost = useMemo(() => {
    return modules
      .filter(m => m.isEnabled)
      .reduce((sum, m) => sum + calculateModulePrice(m, rates), 0);
  }, [modules, rates]);

  // Sort modules
  const sortedModules = useMemo(() => {
    const sorted = [...modules];
    sorted.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
          comparison = calculateModulePrice(a, rates) - calculateModulePrice(b, rates);
          break;
        case 'timeline':
          comparison = Math.max(a.designDays, a.frontendDays, a.backendDays) -
                      Math.max(b.designDays, b.frontendDays, b.backendDays);
          break;
      }
      return sortDesc ? -comparison : comparison;
    });
    return sorted;
  }, [modules, sortBy, sortDesc, rates]);

  const handleSort = (option: SortOption) => {
    if (sortBy === option) {
      setSortDesc(!sortDesc);
    } else {
      setSortBy(option);
      setSortDesc(false);
    }
  };

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Project Modules</h3>
            <p className="text-sm text-gray-600">
              {modules.filter(m => m.isEnabled).length} of {modules.length} enabled • {timelineDays}d timeline • {effortDays}d effort
            </p>
          </div>
          {onBulkToggle && (
            <div className="flex gap-2">
              <button
                onClick={() => onBulkToggle(true)}
                className="px-3 py-1 text-sm font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 rounded transition-colors"
              >
                Enable All
              </button>
              <button
                onClick={() => onBulkToggle(false)}
                className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                Disable All
              </button>
            </div>
          )}
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">Sort by:</span>
          <button
            onClick={() => handleSort('name')}
            className={`px-2 py-1 rounded transition-colors ${
              sortBy === 'name' ? 'bg-primary-100 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Name {sortBy === 'name' && (sortDesc ? '↓' : '↑')}
          </button>
          <button
            onClick={() => handleSort('price')}
            className={`px-2 py-1 rounded transition-colors ${
              sortBy === 'price' ? 'bg-primary-100 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Price {sortBy === 'price' && (sortDesc ? '↓' : '↑')}
          </button>
          <button
            onClick={() => handleSort('timeline')}
            className={`px-2 py-1 rounded transition-colors ${
              sortBy === 'timeline' ? 'bg-primary-100 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Timeline {sortBy === 'timeline' && (sortDesc ? '↓' : '↑')}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {sortedModules.map((module) => {
          const isEnabled = module.isEnabled;
          const fitsInTimeline = !modulesInTimeline || modulesInTimeline.includes(module.id);
          const isExcluded = isEnabled && !fitsInTimeline;
          const modulePrice = calculateModulePrice(module, rates);
          const costPercentage = totalCost > 0 ? Math.round((modulePrice / totalCost) * 100) : 0;

          return (
            <div
              key={module.id}
              onClick={() => onToggle(module.id)}
              className={`rounded-lg p-4 transition-all duration-300 hover:shadow-md cursor-pointer ${
                isExcluded
                  ? 'bg-red-50 border-2 border-red-300 opacity-100'
                  : isEnabled
                  ? 'bg-gray-50 opacity-100'
                  : 'bg-gray-50 opacity-50'
              }`}
            >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <input
                  type="checkbox"
                  checked={module.isEnabled}
                  onChange={() => {}} // Handled by parent div onClick
                  onClick={(e) => e.stopPropagation()} // Prevent double-toggle
                  className="mt-1 w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2 pointer-events-none"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h4 className="font-semibold text-gray-800">{module.name}</h4>
                    {isExcluded && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-red-600 text-white rounded">
                        ⚠️ Won't fit in timeline
                      </span>
                    )}
                    <span className="px-2 py-0.5 text-sm font-semibold bg-green-100 text-green-800 rounded ml-auto">
                      ${modulePrice.toLocaleString()}
                      {isEnabled && totalCost > 0 && (
                        <span className="text-xs text-green-600 ml-1">({costPercentage}%)</span>
                      )}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                    <span>Design: {module.designDays}d</span>
                    <span>Frontend: {module.frontendDays}d</span>
                    <span>Backend: {module.backendDays}d</span>
                    <span className="text-gray-500">
                      Timeline: {Math.max(module.designDays, module.frontendDays, module.backendDays)}d
                    </span>
                  </div>
                  {(module.designPerformers.length > 0 || module.developmentPerformers.length > 0) && (
                    <div className="mt-2 space-y-1">
                      {module.designPerformers.length > 0 && (
                        <div className="flex items-start gap-1">
                          <span className="text-xs text-gray-500 font-medium min-w-[60px]">Design:</span>
                          <div className="flex flex-wrap gap-1">
                            {module.designPerformers.map((performer, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded"
                              >
                                {performer}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {module.developmentPerformers.length > 0 && (
                        <div className="flex items-start gap-1">
                          <span className="text-xs text-gray-500 font-medium min-w-[60px]">Dev:</span>
                          <div className="flex flex-wrap gap-1">
                            {module.developmentPerformers.map((performer, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded"
                              >
                                {performer}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-2">
          <svg
            className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <p className="text-sm font-medium text-blue-900">Note:</p>
            <p className="text-sm text-blue-800">
              Toggle any module on/off to adjust the project scope.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
