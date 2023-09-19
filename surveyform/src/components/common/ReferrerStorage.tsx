"use client";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

const useStoreReferrer = () => {
  const query = useSearchParams()!;
  const source = query.get("source");
  const referrer = query.get("referrer");
  useEffect(() => {
    if (source) {
      localStorage.setItem("source", source.toString());
    }
    if (referrer) {
      localStorage.setItem("referrer", referrer.toString());
    }
  }, []);
};

export const useReferrer = () => {
  const query = useSearchParams()!;
  const source =
    query.get("source") ||
    (typeof localStorage !== "undefined" && localStorage.getItem("source"));
  const referrer =
    query.get("referrer") ||
    (typeof localStorage !== "undefined" && localStorage.getItem("referrer"));
  return { source, referrer };
};

/**
 * Make sure that referrer context is in the local storage
 * Technically it's not a React context
 * because we want the source/referrer to persist thanks to the local storage
 */
export const Referrer = () => {
  useStoreReferrer();
  return null;
};
