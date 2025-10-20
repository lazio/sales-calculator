interface QuoteSummaryProps {
  totalQuote: number;
  monthlyFee: number;
  productPrice: number;
  totalDays: number;
  designDays?: number;
  developmentDays?: number;
  designCost?: number;
  developmentCost?: number;
  teamSizeMultiplier?: number;
  discountAmount?: number;
  finalTotal?: number;
}

export default function QuoteSummary({
  totalQuote,
  monthlyFee,
  totalDays,
  designDays = 0,
  developmentDays = 0,
  designCost = 0,
  developmentCost = 0,
  discountAmount = 0,
  finalTotal
}: QuoteSummaryProps) {
  const displayTotal = finalTotal !== undefined ? finalTotal : totalQuote;
  return (
    <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl shadow-xl p-8 animate-fade-in">
      {/* Total Quote Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">
          {discountAmount > 0 ? 'Final Total' : 'Total Quote'}
        </h2>
        <div className="text-6xl font-bold text-white mb-2">
          ${displayTotal.toLocaleString()}
        </div>
        {discountAmount > 0 && (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-white/60 line-through text-xl">
              ${totalQuote.toLocaleString()}
            </span>
            <span className="px-2 py-1 bg-green-500 text-white text-sm font-semibold rounded">
              -${discountAmount.toLocaleString()} saved
            </span>
          </div>
        )}
        <p className="text-white/90 text-lg">
          {totalDays > 0 ? `${totalDays} working days timeline` : 'Your estimated total'}
        </p>
        {totalDays > 0 && (
          <p className="text-white/70 text-sm mt-1">
            Design and development work in parallel
          </p>
        )}
      </div>

      {/* Work Breakdown */}
      {totalDays > 0 && (
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
                All work in parallel
                <span className="invisible group-hover:visible absolute left-0 top-6 w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-10">
                  All modules work in parallel. Design, frontend, and backend happen simultaneously across all modules.
                </span>
              </span>
            </div>
          </div>

          {/* Work Summary */}
          <div className="space-y-2">
            {designDays > 0 && (
              <div className="flex items-center justify-between text-white/90">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-purple-400"></span>
                  Design Effort
                </span>
                <span className="font-semibold">{designDays} days</span>
              </div>
            )}

            {developmentDays > 0 && (
              <div className="flex items-center justify-between text-white/90">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-400"></span>
                  Development Effort
                </span>
                <span className="font-semibold">{developmentDays} days</span>
              </div>
            )}
          </div>

          {/* Total Timeline */}
          <div className="pt-3 mt-3 border-t border-white/20">
            <div className="flex items-center justify-between mb-1">
              <span className="text-white/90 text-sm">Total Project Timeline</span>
              <span className="text-white font-bold text-lg">{totalDays} days</span>
            </div>
            <p className="text-white/60 text-xs">
              {designDays + developmentDays} total effort days completed in {totalDays} calendar days due to parallel work
            </p>
          </div>
        </div>
      )}

      {/* Price Breakdown */}
      <div className="space-y-4 mb-8">
        {/* Design Phase */}
        {designDays > 0 && (
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-5">
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-lg font-semibold text-white">Design Phase</h3>
              <span className="text-2xl font-bold text-white">
                ${designCost.toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-white/80">{designDays} days</p>
          </div>
        )}

        {/* Development Phase */}
        {developmentDays > 0 && (
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-5">
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-lg font-semibold text-white">Development Phase</h3>
              <span className="text-2xl font-bold text-white">
                ${developmentCost.toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-white/80">{developmentDays} days</p>
          </div>
        )}

        {/* Monthly Fee */}
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-5">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-lg font-semibold text-white">Monthly Rate Card</h3>
            <span className="text-2xl font-bold text-white">
              ${monthlyFee.toLocaleString()}
            </span>
          </div>
          <p className="text-sm text-white/80">Total monthly fee for all performers</p>
        </div>
      </div>
    </div>
  );
}
