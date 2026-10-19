"use client";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

// Discard stored source/referrer values older than this, so that a source from
// one survey year doesn't keep applying indefinitely in future years.
const MAX_AGE = 1000 * 60 * 60 * 24 * 90; // 90 days (~3 months)

/**
 * Store a value in localStorage alongside the current timestamp.
 */
const storeWithTimestamp = (key: string, value: string) => {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(key, value);
  localStorage.setItem(`${key}_timestamp`, Date.now().toString());
};

/**
 * Read a value from localStorage, discarding (and clearing) it if it's older
 * than MAX_AGE or has no recorded timestamp.
 */
const readWithTimestamp = (key: string): string | null => {
  if (typeof localStorage === "undefined") return null;
  const value = localStorage.getItem(key);
  if (!value) return null;
  const timestamp = Number(localStorage.getItem(`${key}_timestamp`));
  if (!timestamp || Date.now() - timestamp > MAX_AGE) {
    localStorage.removeItem(key);
    localStorage.removeItem(`${key}_timestamp`);
    return null;
  }
  return value;
};

const useStoreReferrer = () => {
  const query = useSearchParams()!;
  const sourceParam = query.get("source");
  const utmSourceParam = query.get("utm_source");
  const refParam = query.get("ref");
  const source = sourceParam || refParam || utmSourceParam;
  const referrer = query.get("referrer");
  useEffect(() => {
    if (source) {
      storeWithTimestamp("source", source.toString());
    }
    if (referrer) {
      storeWithTimestamp("referrer", referrer.toString());
    }
  }, []);
};

export const useReferrer = () => {
  const query = useSearchParams()!;
  const source = query.get("source") || readWithTimestamp("source");
  const referrer = query.get("referrer") || readWithTimestamp("referrer");
  return { source, referrer };
};

/**
 * Make sure that referrer context is in the local storage
 * Technically it's not a React context
 * because we want the source/referrer to persist thanks to the local storage
 */
export const Referrer = () => {
  return <Suspense><ReferrerRaw /></Suspense>
};

/**
 * useSearchParams must be wrapped with a Suspense
 * to prevent client-side rendering up to the highest suspense boudary
 */
const ReferrerRaw = () => {
  useStoreReferrer();
  return null
}