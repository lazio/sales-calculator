import { ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

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
    <Alert variant="destructive">
      <div className="flex items-start gap-3">
        {icon || (
          <svg
            className="w-5 h-5 flex-shrink-0 mt-0.5"
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
          <AlertTitle>{title}</AlertTitle>
          <AlertDescription className="mt-1">{message}</AlertDescription>
          {onRetry && (
            <Button
              onClick={onRetry}
              variant="destructive"
              size="sm"
              className="mt-3"
            >
              Try Again
            </Button>
          )}
        </div>
      </div>
    </Alert>
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
