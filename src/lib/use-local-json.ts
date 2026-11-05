"use client";

import { useCallback, useSyncExternalStore } from "react";

const listeners = new Set<() => void>();
const parsedCache = new Map<string, { raw: string | null; value: unknown }>();

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

/**
 * JSON value persisted in localStorage, safe for SSR (server renders `fallback`) and for blocked
 * storage (falls back to in-memory for the visit). Snapshots are cached by raw string so React
 * sees a stable reference until the stored value actually changes.
 */
export function useLocalJSON<T>(key: string, fallback: T): [T, (next: T | null) => void] {
  const getSnapshot = useCallback((): T => {
    const raw = read(key);
    const hit = parsedCache.get(key);
    if (hit && hit.raw === raw) return hit.value as T;
    let value: T = fallback;
    if (raw !== null) {
      try {
        value = JSON.parse(raw) as T;
      } catch {
        value = fallback;
      }
    }
    parsedCache.set(key, { raw, value });
    return value;
  }, [key, fallback]);

  const value = useSyncExternalStore(subscribe, getSnapshot, () => fallback);

  const set = useCallback(
    (next: T | null) => {
      try {
        if (next === null) localStorage.removeItem(key);
        else localStorage.setItem(key, JSON.stringify(next));
      } catch {
        parsedCache.set(key, { raw: null, value: next ?? fallback });
      }
      listeners.forEach((l) => l());
    },
    [key, fallback],
  );

  return [value, set];
}
