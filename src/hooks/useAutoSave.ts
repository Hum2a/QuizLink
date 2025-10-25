import { useEffect, useRef, useCallback } from 'react';

interface AutoSaveOptions {
  delay?: number;
  onSave: () => void;
  dependencies?: unknown[];
}

export const useAutoSave = ({
  delay = 2000,
  onSave,
  dependencies = [],
}: AutoSaveOptions) => {
  const timeoutRef = useRef<number | null>(null);
  const lastSaveRef = useRef<number>(0);

  const saveCallback = useCallback(() => {
    onSave();
  }, [onSave]);

  useEffect(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = window.setTimeout(() => {
      const now = Date.now();
      // Only save if enough time has passed since last save
      if (now - lastSaveRef.current > delay) {
        saveCallback();
        lastSaveRef.current = now;
      }
    }, delay);

    // Cleanup on unmount or dependency change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [delay, saveCallback, ...dependencies]);

  // Manual save function
  const saveNow = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    saveCallback();
    lastSaveRef.current = Date.now();
  }, [saveCallback]);

  return { saveNow };
};

export default useAutoSave;
