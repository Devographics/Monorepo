import { useLocaleContext } from "../components/LocaleContext";

/**
 * List possible locales (without strings, just the local meta informations)
 * @returns
 */
export const useLocales = () => {
  const { getLocaleDefs } = useLocaleContext();
  return { locales: getLocaleDefs() };
};
