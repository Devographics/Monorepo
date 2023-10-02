import React from "react";

export const useLocalStorage = (storageKey, fallbackState) => {
  let initState = fallbackState;
  try {
    const localStorageState = localStorage.getItem(storageKey);
    if (localStorageState) {
      initState = JSON.parse(localStorageState);
    }
  } catch (error) {}
  const [value, setValue] = React.useState(initState);

  React.useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(value));
  }, [value, storageKey]);

  return [value, setValue];
};
