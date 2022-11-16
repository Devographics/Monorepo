import { useLocaleContext } from "../components/LocaleContext";

/**
Get the string for a given locale
@deprecated We can get the locale from context directly?
*/
export const useLocaleData = (props: { currentUser?: any; locale?: any }) => {
  const { getLocale } = useLocaleContext();
  const locale = getLocale();
  return { id: locale.id, strings: locale.strings };
};
