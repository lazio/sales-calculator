import { ProjectModule } from '../../types/project.types';
import { RateConfig } from '../../types/rates.types';

interface ModuleListProps {
  modules: ProjectModule[];
  onToggle: (id: string) => void;
  modulesInTimeline?: string[]; // IDs of modules that fit in the timeline
  rates: RateConfig[];
}

export default function ModuleList({ modules, onToggle, modulesInTimeline, rates }: ModuleListProps) {
  if (modules.length === 0) {
    return null;
  }

  // Calculate timeline (parallel work: max of frontend/backend per module)
  const timelineDays = modules
    .filter(m => m.isEnabled)
    .reduce((sum, m) => sum + Math.max(m.frontendDays, m.backendDays), 0);

  // Calculate total effort (sum of all work)
  const effortDays = modules
    .filter(m => m.isEnabled)
    .reduce((sum, m) => sum + m.frontendDays + m.backendDays, 0);

  // Calculate price for a specific module
  const calculateModulePrice = (module: ProjectModule): number => {
    const monthlyFee = rates.reduce((sum, rate) => sum + rate.monthlyRate, 0);
    const moduleTimeline = Math.max(module.frontendDays, module.backendDays);
    return Math.round((monthlyFee / 20) * moduleTimeline);
  };

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Project Modules</h3>
          <p className="text-sm text-gray-600">
            {modules.filter(m => m.isEnabled).length} of {modules.length} enabled • {timelineDays}d timeline • {effortDays}d effort
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {modules.map((module) => {
          const isEnabled = module.isEnabled;
          const fitsInTimeline = !modulesInTimeline || modulesInTimeline.includes(module.id);
          const isExcluded = isEnabled && !fitsInTimeline;

          return (
            <div
              key={module.id}
              className={`rounded-lg p-4 transition-all duration-300 hover:shadow-md ${
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
                  onChange={() => onToggle(module.id)}
                  className="mt-1 w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
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
                      ${calculateModulePrice(module).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                    <span>Frontend: {module.frontendDays}d</span>
                    <span>Backend: {module.backendDays}d</span>
                    <span className="text-gray-500">
                      Total: {module.frontendDays + module.backendDays}d
                    </span>
                  </div>
                  {module.performers.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {module.performers.map((performer, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 text-xs bg-gray-200 text-gray-700 rounded"
                        >
                          {performer}
                        </span>
                      ))}
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
