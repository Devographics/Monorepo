import { useStore } from "@nanostores/react";
import { getStringTranslator, type Locale } from "./translator";
import React, { useEffect } from "react";
import { i18nStore } from "./i18nStore";

// Update the store
export const updateI18nStore = (locale: Locale, locales: Locale[]) => {
  console.log("locale.id update", locale.id);
  const getString = getStringTranslator(locale);
  i18nStore.set({
    locale,
    locales,
    getString,
  });
};

// Hook to use i18n in components
export const useI18n = () => {
  const store = useStore(i18nStore);
  return store;
};

// Optional: Provider component if you want to initialize the store at the top level
export const I18nProvider: React.FC<{
  locale: Locale;
  locales: Locale[];
  children: React.ReactNode;
}> = ({ locale, locales, children }) => {
  useEffect(() => {
    updateI18nStore(locale, locales);
  }, [locale, locales]);

  return <>{children}</>;
};
