"use client";

import { useLocaleContext } from "~/i18n/context/LocaleContext";
import { Dropdown } from "~/components/ui/Dropdown";



import { T } from "@devographics/react-i18n"
import { useParams, usePathname, useRouter } from "next/navigation";

/**
 * We suppose the current locale is known and is in the URL
 * "/fr-FR"
 * "/fr-FR/foobar"
 * 
 * There is no method to just remove a param from the router pathname yet
 */
function replaceLocale(pathname: string, params: any, newLocale: string) {
  if (!(params.lang && typeof params.lang === "string")) {
    console.warn(`No params found when switching locale, will append the newly selected locale to the pathname "${pathname}"`)
    return `/${newLocale}${pathname}`
  }
  return pathname.replace(params.lang, newLocale)
}

const LocaleSwitcher = () => {
  const router = useRouter()
  const params = useParams()
  const pathname = usePathname()
  const { locales = [] } = useLocaleContext();
  const { locale: currentLocale, setLocale } = useLocaleContext();

  const showSwitcher = locales.filter((l) => l.id !== "en-US").length > 0;

  return showSwitcher ? (
    <Dropdown
      buttonProps={{
        variant: "default",
      }}
      label={
        currentLocale?.label || (currentLocale?.id && <T
          token={currentLocale?.id} />) || "Please select a locale"
      }
      id="locale-dropdown"
      className="nav-locale-dropdown"
      //@ts-ignore TODO: why onSelect doesn't exist
      onSelect={(index) => {
        if (!index) {
          index = 0;
        }
        const locale = locales[index]
        setLocale(locale.id);
        router.replace(replaceLocale(pathname, params, locale.id))
      }}
      menuItems={locales.map(({ label, id }) => ({
        label: id === currentLocale?.id ? `${label} ✓` : label,
      }))}
    />
  ) : null;
};

export default LocaleSwitcher;
