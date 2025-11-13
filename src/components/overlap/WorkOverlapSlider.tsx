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
    <div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground">
            When development starts after design begins
          </p>
        </div>
        <div>
          <div className="font-bold">
            {currentWeeks === maxWeeks ? 'Fully Parallel' : `+${currentWeeks} week${currentWeeks !== 1 ? 's' : ''}`}
          </div>
          <div className="text-muted-foreground">
            {overlapDays === 0 ? 'Sequential' : `${overlapDays} days overlap`}
          </div>
        </div>
      </div>

      <div>
        <Slider
          min={0}
          max={maxWeeks}
          step={1}
          value={[currentWeeks]}
          onValueChange={handleWeeksChange}
        />
        <div className="flex justify-between text-muted-foreground">
          <span>Sequential</span>
          <span>
            {Math.floor(maxWeeks / 2)} wks
          </span>
          <span>Parallel</span>
        </div>
      </div>
    </div>
  );
}
