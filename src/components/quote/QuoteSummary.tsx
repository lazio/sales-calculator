interface QuoteSummaryProps {
  totalQuote: number;
  monthlyFee: number;
  productPrice: number;
  totalDays: number;
  teamSizeMultiplier?: number;
  discountAmount?: number;
  finalTotal?: number;
}

export default function QuoteSummary({
  totalQuote,
  monthlyFee,
  productPrice,
  totalDays,
  teamSizeMultiplier = 1,
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
            Frontend and backend work in parallel
          </p>
        )}
      </div>

      {/* Price Breakdown */}
      <div className="space-y-4 mb-8">
        {/* Monthly Fee */}
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-5">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-lg font-semibold text-white">Monthly Fee</h3>
            <span className="text-2xl font-bold text-white">
              ${monthlyFee.toLocaleString()}
            </span>
          </div>
          <p className="text-sm text-white/80">Total monthly fee for all performers</p>
        </div>

        {/* Product Price */}
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-5">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-lg font-semibold text-white">Product Price</h3>
            <span className="text-2xl font-bold text-white">
              ${productPrice.toLocaleString()}
            </span>
          </div>
          <p className="text-sm text-white/80">
            (${monthlyFee.toLocaleString()} / 20 days) × {totalDays} days
          </p>
        </div>
      </div>
    </div>
  );
}
