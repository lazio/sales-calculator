import { ReactNode } from 'react';

interface ErrorFallbackProps {
  title: string;
  message: string;
  onRetry?: () => void;
  icon?: ReactNode;
}

/**
 * Reusable error fallback component for specific features
 */
export function ErrorFallback({ title, message, onRetry, icon }: ErrorFallbackProps) {
  return (
    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
      <div className="flex items-start gap-3">
        {icon || (
          <svg
            className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        )}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-red-900 mb-1">{title}</h3>
          <p className="text-sm text-red-700 mb-3">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Specific error fallback for CSV Import
 */
export function CSVImportErrorFallback() {
  return (
    <ErrorFallback
      title="CSV Import Error"
      message="There was an error processing your CSV file. Please check the file format and try again."
    />
  );
}

/**
 * Specific error fallback for Rate Configuration
 */
export function RateConfigErrorFallback() {
  return (
    <ErrorFallback
      title="Rate Configuration Error"
      message="Unable to load rate configuration. Your rates data may be corrupted. Try clearing your browser data or contact support."
    />
  );
}

/**
 * Specific error fallback for Calculations
 */
export function CalculationErrorFallback() {
  return (
    <ErrorFallback
      title="Calculation Error"
      message="An error occurred while calculating your quote. Please check your module configuration and try again."
    />
  );
}
