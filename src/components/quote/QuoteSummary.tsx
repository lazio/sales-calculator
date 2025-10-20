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
