interface QuoteSummaryProps {
  totalQuote: number;
  monthlyFee: number;
  productPrice: number;
  totalDays: number;
  teamSizeMultiplier?: number;
}

export default function QuoteSummary({
  totalQuote,
  monthlyFee,
  productPrice,
  totalDays,
  teamSizeMultiplier = 1
}: QuoteSummaryProps) {
  return (
    <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl shadow-xl p-8">
      {/* Total Quote Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Total Quote</h2>
        <div className="text-6xl font-bold text-white mb-2">
          ${totalQuote.toLocaleString()}
        </div>
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

      {/* Call to Action */}
      <div className="pt-6 border-t border-white/30">
        <h3 className="text-xl font-bold text-white mb-3">
          Ready to Get Started?
        </h3>
        <p className="text-white/90 text-sm mb-5">
          Get your project moving today with our competitive pricing.
          Reach out for a detailed consultation.
        </p>
        <button className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98]">
          Request a Quote
        </button>
      </div>
    </div>
  );
}
