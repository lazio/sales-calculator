import { RateConfig } from '../../types/rates.types';

interface RateConfigurationProps {
  rates: RateConfig[];
  onRateChange: (index: number, newRate: number) => void;
}

export default function RateConfiguration({ rates, onRateChange }: RateConfigurationProps) {
  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Monthly Rates</h3>
        <p className="text-sm text-gray-600">Configure the monthly rates for each team role</p>
      </div>

      <div className="space-y-3">
        {rates.map((rate, index) => (
          <div
            key={rate.role}
            className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-150"
          >
            <label className="block">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-700">{rate.role}</span>
                <span className="text-sm text-gray-500">$/month</span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 font-semibold">
                  $
                </span>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={rate.monthlyRate}
                  onChange={(e) => onRateChange(index, Number(e.target.value))}
                  className="w-full pl-8 pr-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-150 outline-none font-semibold text-gray-900"
                  placeholder="8000"
                />
              </div>
            </label>
          </div>
        ))}
      </div>

      <div className="mt-4 p-4 bg-primary-50 rounded-lg border border-primary-200">
        <div className="flex items-start gap-2">
          <svg
            className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0"
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
            <p className="text-sm font-medium text-primary-900">Auto-saved:</p>
            <p className="text-sm text-primary-700">
              Your rates are automatically saved to local storage
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
