import { Slider } from '@/components/ui/slider';

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

  const handleWeeksChange = (value: number[]) => {
    const days = value[0] * WEEK_IN_DAYS;
    onOverlapChange(days);
  };

  // If no work, don't show slider
  if (maxOverlapDays === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          When development starts after design begins
        </p>
        <div className="text-right">
          <div className="text-sm font-medium">
            {currentWeeks === maxWeeks ? 'Fully Parallel' : currentWeeks === 0 ? 'Sequential' : `${currentWeeks} week${currentWeeks !== 1 ? 's' : ''} overlap`}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Slider
          min={0}
          max={maxWeeks}
          step={1}
          value={[currentWeeks]}
          onValueChange={handleWeeksChange}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Sequential</span>
          <span>
            {Math.floor(maxWeeks / 2)} week{Math.floor(maxWeeks / 2) !== 1 ? 's' : ''}
          </span>
          <span>Parallel</span>
        </div>
      </div>
    </div>
  );
}
