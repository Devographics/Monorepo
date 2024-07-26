"use client";

import { Dropdown } from "~/components/ui/Dropdown";

import { T, useI18n } from "@devographics/react-i18n";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useCallback } from "react";

/**
 * We suppose the current locale is known and is in the URL
 * "/fr-FR"
 * "/fr-FR/foobar"
 *
 * There is no method to just remove a param from the router pathname yet
 */
function replaceLocale(pathname: string, params: any, newLocale: string) {
  if (!(params.lang && typeof params.lang === "string")) {
    console.warn(
      `No params found when switching locale, will append the newly selected locale to the pathname "${pathname}"`
    );
    return `/${newLocale}${pathname}`;
  }
  return pathname.replace(params.lang, newLocale);
}

function useLocaleSwitcher() {
  // In previous implementations we were using a locale cookies
  // now we use locales indicated directly in the URL
  const router = useRouter()
  const pathname = usePathname();
  const params = useParams();
  const switchLocale = useCallback((newLocale) => {
    router.replace(replaceLocale(pathname || "", params, newLocale.id));
  }, [router, params?.lang])
  return switchLocale
}

const LocaleSwitcher = () => {
  const switchLocale = useLocaleSwitcher()
  const { locale: currentLocale, allLocales } = useI18n()

  const currentLocaleDef = allLocales.find(l => l.id === currentLocale.id) || currentLocale

  const showSwitcher = allLocales.length > 0;

  return showSwitcher ? (
    <Dropdown
      buttonProps={{
        variant: "default",
      }}
      label={
        currentLocaleDef?.label ||
        (currentLocaleDef?.id && <T token={currentLocaleDef?.id} />) ||
        "Please select a locale"
      }
      id="locale-dropdown"
      className="nav-locale-dropdown"
      //@ts-ignore TODO: why onSelect doesn't exist
      onSelect={(index) => {
        if (!index) {
          index = 0;
        }
        const newLocale = allLocales[index];
        switchLocale(newLocale)
      }}
      menuItems={allLocales.map(({ label, id }) => ({
        label: id === currentLocale?.id ? `${label} ✓` : label,
      }))}
    />
  ) : null;
};

export default LocaleSwitcher;
