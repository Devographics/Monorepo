import { useState, useEffect } from "react";

export const useLocalStorage = (storageKey: string, fallbackState: any) => {
  const item = localStorage.getItem(storageKey);
  const [value, setValue] = useState(
    (item && JSON.parse(item)) ?? fallbackState
  );

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(value));
  }, [value, storageKey]);

  return [value, setValue];
};
