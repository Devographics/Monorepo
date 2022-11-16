import React from "react";
import { useLocales } from "~/i18n/hooks/locales";
import { useVulcanComponents } from "@vulcanjs/react-ui";
import { useLocaleContext } from "~/i18n/components/LocaleContext";

const LocaleSwitcher = () => {
  const Components = useVulcanComponents();
  const { locales = [] } = useLocales();
  const { getLocale, setLocale } = useLocaleContext();
  const currentLocale = getLocale();
  return (
    <Components.Dropdown
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
