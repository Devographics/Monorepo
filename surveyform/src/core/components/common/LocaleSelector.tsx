"use client";
import React from "react";
import { FormattedMessage } from "~/core/components/common/FormattedMessage";
import { useLocaleContext } from "~/i18n/context/LocaleContext";

const LocaleSelector = () => {
  const { locales } = useLocaleContext();
  const { setLocale } = useLocaleContext();

  return (
    <div className="locale-selector">
      <p className="locale-selector-languages">
        <FormattedMessage id="general.surveys_available_languages" />{" "}
        {locales.map(({ label, id }, i) => (
          <span key={id} className="locale-selector-item">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setLocale(id);
              }}
            >
              {label}
            </a>
            {i < locales.length - 1 ? <span>, </span> : <span>. </span>}
          </span>
        ))}
      </p>
      <a
        className="locale-selector-help"
        href="https://github.com/Devographics/Translations/issues/1"
        target="_blank"
        rel="noreferrer"
      >
        <FormattedMessage id="general.help_us_translate" />
      </a>
    </div>
  );
};

export default LocaleSelector;
