import { useEffect, useState } from 'react';
import type { SetURLSearchParams } from 'react-router-dom';

export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}

export function useSearchDraft(urlSearch: string, setParams: SetURLSearchParams) {
  const [draft, setDraft] = useState(urlSearch);
  const debounced = useDebouncedValue(draft, 300);

  useEffect(() => {
    setDraft(urlSearch);
  }, [urlSearch]);

  useEffect(() => {
    setParams(
      (previous) => {
        const current = previous.get('search') ?? '';
        if (debounced === current) {
          return previous;
        }
        const next = new URLSearchParams(previous);
        if (debounced) {
          next.set('search', debounced.slice(0, 100));
        } else {
          next.delete('search');
        }
        next.delete('page');
        return next;
      },
      { replace: true },
    );
  }, [debounced, setParams]);

  return { draft, setDraft };
}
