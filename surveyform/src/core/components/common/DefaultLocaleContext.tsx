import React, { useContext } from "react";

import { useLocaleData } from "~/i18n/hooks/useLocaleData";
import type { LocaleType } from "@vulcanjs/i18n";

const DefaultLocaleContext = React.createContext<{
  defaultLocale?: LocaleType;
}>({
  defaultLocale: undefined,
});

export const useDefaultLocaleContext = () => useContext(DefaultLocaleContext);

export const DefaultLocaleContextProvider = ({ children }) => {
  // do not load default locale for now since we are using fallbacks

  // const defaultLocaleId = getSetting('defaultLocaleId');
  const defaultLocaleId = "en-US";
  const defaultLocaleResult = useLocaleData({ locale: defaultLocaleId });
  const defaultLocale = defaultLocaleResult?.data?.locale;
  return (
    <DefaultLocaleContext.Provider value={{ defaultLocale }}>
      {children}
    </DefaultLocaleContext.Provider>
  );
};

export default DefaultLocaleContext;
