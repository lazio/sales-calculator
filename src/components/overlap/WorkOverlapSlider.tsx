interface WorkOverlapSliderProps {
  overlapDays: number;
  maxOverlapDays: number; // Based on min(designDays, devDays)
  onOverlapChange: (days: number) => void;
}

const WEEK_IN_DAYS = 5; // Business days per week

export default function WorkOverlapSlider({
  overlapDays,
  maxOverlapDays,
  onOverlapChange,
}: WorkOverlapSliderProps) {
  // Calculate number of weeks
  const maxWeeks = Math.floor(maxOverlapDays / WEEK_IN_DAYS);
  const currentWeeks = Math.min(Math.floor(overlapDays / WEEK_IN_DAYS), maxWeeks);

  const handleWeeksChange = (weeks: number) => {
    const days = weeks * WEEK_IN_DAYS;
    onOverlapChange(days);
  };

  // If no work, don't show slider
  if (maxOverlapDays === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">Work Overlap</h3>
          <p className="text-xs text-gray-600">
            When development starts after design begins
          </p>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-primary-600">
            {currentWeeks === maxWeeks ? 'Fully Parallel' : `+${currentWeeks} week${currentWeeks !== 1 ? 's' : ''}`}
          </div>
          <div className="text-xs text-gray-500">
            {overlapDays === 0 ? 'Sequential' : `${overlapDays} days overlap`}
          </div>
        </div>
      </div>

      <div>
        <input
          type="range"
          min="0"
          max={maxWeeks}
          step="1"
          value={currentWeeks}
          onChange={(e) => handleWeeksChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
        />
        <div className="flex justify-between mt-1 text-xs text-gray-500">
          <span>Sequential</span>
          <span className="text-center">
            {Math.floor(maxWeeks / 2)} wks
          </span>
          <span>Parallel</span>
        </div>
      </div>

      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-2">
          <svg
            className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div className="text-xs text-blue-800">
            {overlapDays === 0 ? (
              <p><strong>Sequential:</strong> Design completes first, then development starts</p>
            ) : overlapDays >= maxOverlapDays ? (
              <p><strong>Fully Parallel:</strong> Design and development happen simultaneously</p>
            ) : (
              <p><strong>{currentWeeks} week overlap:</strong> Development starts {currentWeeks} week{currentWeeks !== 1 ? 's' : ''} after design begins</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
