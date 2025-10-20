interface TimelineVisualizationProps {
  designDays: number;
  developmentDays: number;
  totalDays: number;
}

export default function TimelineVisualization({
  designDays,
  developmentDays,
  totalDays,
}: TimelineVisualizationProps) {
  if (totalDays === 0) return null;

  // Calculate what percentage of the timeline includes each phase
  // Since they overlap, both can be close to 100%
  const totalEffort = designDays + developmentDays;
  const designPercent = totalEffort > 0 ? (designDays / totalEffort) * 100 : 0;
  const developmentPercent = totalEffort > 0 ? (developmentDays / totalEffort) * 100 : 0;

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 mb-8">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-white">Work Breakdown</h3>
        <div className="flex items-center gap-2 text-sm text-white/80">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="group relative cursor-help">
            Effort breakdown
            <span className="invisible group-hover:visible absolute left-0 top-6 w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-10">
              This shows the total work effort for each phase. Design and development happen in parallel within each module, so the actual timeline is shorter than the sum of efforts.
            </span>
          </span>
        </div>
      </div>

      {/* Visual Timeline */}
      <div className="space-y-3 mb-4">
        {/* Design Phase Bar */}
        {designDays > 0 && (
          <div>
            <div className="flex items-center justify-between text-sm text-white/90 mb-1">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-purple-400"></span>
                Design Effort
              </span>
              <span className="font-semibold">{designDays} days</span>
            </div>
            <div className="relative h-8 bg-white/20 rounded-lg overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-purple-400 to-purple-500 rounded-lg transition-all duration-500 flex items-center justify-center text-white text-sm font-semibold"
                style={{ width: `${Math.max(designPercent, 10)}%` }}
              >
                {designPercent >= 15 && `${Math.round(designPercent)}%`}
              </div>
            </div>
          </div>
        )}

        {/* Development Phase Bar */}
        {developmentDays > 0 && (
          <div>
            <div className="flex items-center justify-between text-sm text-white/90 mb-1">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-400"></span>
                Development Effort
              </span>
              <span className="font-semibold">{developmentDays} days</span>
            </div>
            <div className="relative h-8 bg-white/20 rounded-lg overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-lg transition-all duration-500 flex items-center justify-center text-white text-sm font-semibold"
                style={{ width: `${Math.max(developmentPercent, 10)}%` }}
              >
                {developmentPercent >= 15 && `${Math.round(developmentPercent)}%`}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Total Timeline Indicator */}
      <div className="pt-3 border-t border-white/20">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/90 text-sm">Total Project Timeline</span>
          <span className="text-white font-bold text-lg">{totalDays} days</span>
        </div>
        <p className="text-white/60 text-xs">
          {designDays + developmentDays} total effort days completed in {totalDays} calendar days due to parallel work
        </p>
      </div>
    </div>
  );
}
