import { useCallback, useRef, useState, useEffect } from 'react';

// Custom hook to prevent infinite re-renders with API functions
export function useStableCallback<T extends (...args: any[]) => any>(callback: T): T {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;
  
  return useCallback((...args: any[]) => {
    return callbackRef.current(...args);
  }, []) as T;
}

// Debounce hook to prevent rapid API calls
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Request deduplication hook
const requestCache = new Map<string, Promise<any>>();

export function useDeduplicatedRequest<T>(
  key: string,
  requestFn: () => Promise<T>
): Promise<T> {
  if (requestCache.has(key)) {
    return requestCache.get(key)!;
  }

  const promise = requestFn();
  requestCache.set(key, promise);
  
  // Clean up cache after request completes
  promise.finally(() => {
    requestCache.delete(key);
  });

  return promise;
}
