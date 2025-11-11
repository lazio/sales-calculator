import { useState, useCallback } from 'react';

/**
 * Custom hook for clipboard operations with auto-reset feedback
 */
export function useClipboard(resetDelay = 2000) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);

      // Auto-reset after delay
      setTimeout(() => setCopied(false), resetDelay);

      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }, [resetDelay]);

  const reset = useCallback(() => {
    setCopied(false);
  }, []);

  return {
    copied,
    copyToClipboard,
    reset
  };
}
