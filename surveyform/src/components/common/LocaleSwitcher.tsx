"use client";

import { useLocaleContext } from "~/i18n/context/LocaleContext";
import { Dropdown } from "~/components/ui/Dropdown";



import { T } from "@devographics/react-i18n"

const LocaleSwitcher = () => {
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
        setLocale(locales[index].id);
        // TODO: there is currently no method to replace only a parameter in the current route
        // so have to do a hard refresh
        window.location.reload();
      }}
      menuItems={locales.map(({ label, id }) => ({
        label: id === currentLocale?.id ? `${label} ✓` : label,
      }))}
    />
  ) : null;
};

export default LocaleSwitcher;
