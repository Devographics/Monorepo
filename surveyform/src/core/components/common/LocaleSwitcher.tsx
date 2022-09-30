import React from "react";
import { useLocales } from "~/i18n/hooks/locales";
import { useVulcanComponents } from "@vulcanjs/react-ui";
import { useLocaleContext } from "~/i18n/components/LocaleContext";
import { getLocale } from "~/i18n";

const LocaleSwitcher = () => {
  const Components = useVulcanComponents();
  const { loading, locales = [] } = useLocales();
  const { getLocale: getLocaleContext, setLocale } = useLocaleContext();

  if (loading) {
    return <Components.Loading />;
  }

  const currentLocaleId = getLocaleContext();
  const currentLocale = getLocale(currentLocaleId);
  return (
    <Components.Dropdown
      buttonProps={{
        variant: "default",
      }}
      label={(currentLocale && currentLocale.label) || currentLocaleId}
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
