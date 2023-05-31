"use client";

import { useLocaleContext } from "~/i18n/context/LocaleContext";
import { Dropdown } from "~/components/ui/Dropdown";

const LocaleSwitcher = () => {
  const { locales = [] } = useLocaleContext();
  const { locale: currentLocale, setLocale } = useLocaleContext();
  return (
    <Dropdown
      buttonProps={{
        variant: "default",
      }}
      label={
        currentLocale?.label || currentLocale?.id || "Please select a locale"
      }
      id="locale-dropdown"
      onSelect={(index) => {
        if (!index) {
          index = 0;
        }
        setLocale(locales[index].id);
        // TODO: there is currently no method to replace only a parameter in the current route
        // so have to do a hard refresh
        window.location.reload();
      }}
      className="nav-locale-dropdown"
      menuItems={locales.map(({ label, id }) => ({
        label: id === currentLocale?.id ? `${label} ✓` : label,
      }))}
    />
  );
};

export default LocaleSwitcher;
