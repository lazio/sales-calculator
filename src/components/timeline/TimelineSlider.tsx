import { useEffect, useState } from 'react';

interface TimelineSliderProps {
  minDays: number;
  maxDays: number;
  currentDays: number; // The actual current slider value
  optimalDays: number; // The optimal timeline for display
  onTimelineChange: (days: number) => void;
}

export default function TimelineSlider({
  minDays,
  maxDays,
  currentDays,
  optimalDays,
  onTimelineChange,
}: TimelineSliderProps) {
  const [sliderValue, setSliderValue] = useState(currentDays);

  // Sync slider value when currentDays changes (e.g., when modules are toggled)
  useEffect(() => {
    setSliderValue(currentDays);
  }, [currentDays]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setSliderValue(value);
    onTimelineChange(value);
  };

  // Calculate percentage for visual progress bar
  const percentage = maxDays > minDays
    ? ((sliderValue - minDays) / (maxDays - minDays)) * 100
    : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Timeline Adjustment</h3>
        <span className="text-sm text-gray-600">
          {sliderValue} days
        </span>
      </div>

      <div className="space-y-2">
        {/* Slider */}
        <div className="relative">
          <input
            type="range"
            min={minDays}
            max={maxDays}
            value={sliderValue}
            onChange={handleSliderChange}
            disabled={maxDays === 0}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              background: maxDays > 0
                ? `linear-gradient(to right, #5BA3D0 0%, #5BA3D0 ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`
                : '#e5e7eb'
            }}
          />
        </div>

        {/* Labels */}
        <div className="flex justify-between text-xs text-gray-500">
          <span>Min: {minDays}d (50%)</span>
          <span>Max: {maxDays}d</span>
        </div>
      </div>

      {/* Info Box */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
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
            <p className="text-sm font-medium text-blue-900">Timeline Impact:</p>
            <p className="text-sm text-blue-800">
              {sliderValue < optimalDays && (
                <>Compressed timeline will exclude modules from the bottom. Excluded modules will be highlighted in red.</>
              )}
              {sliderValue === optimalDays && (
                <>This is the optimal timeline. All enabled modules fit perfectly.</>
              )}
            </p>
          </div>
        </div>
      </div>

      {maxDays === 0 && (
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-600 text-center">
            Import a CSV file and enable modules to adjust timeline
          </p>
        </div>
      )}
    </div>
  );
}
