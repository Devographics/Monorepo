import React from "react";
import { useLocaleContext } from "~/i18n/context/LocaleContext";
import { Dropdown } from "~/core/components/ui/Dropdown";

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
      }}
      className="nav-locale-dropdown"
      menuItems={locales.map(({ label, id }) => ({
        label: id === currentLocale?.id ? `${label} ✓` : label,
      }))}
    />
  );
};

export default LocaleSwitcher;
