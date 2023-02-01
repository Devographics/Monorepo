import React from "react";
import sanitizeHtml from "sanitize-html";
import { useKeydownContext } from "./KeydownContext";
import { useDefaultLocaleContext } from "./DefaultLocaleContext";
import { useIntlContext } from "@devographics/react-i18n";
import { stringsRegistry } from "~/i18n";

export const FormattedMessage = ({
  id,
  values,
  defaultMessage = "",
  html = false,
  className = "",
}: {
  id: string;
  values?: any;
  defaultMessage?: string;
  /**
   * Allow HTML, useful to add aria-hints of icons for example
   */
  html?: boolean;

  className?: string;
}) => {
  const intl = useIntlContext();
  const { modKeyDown } = useKeydownContext();
  const { defaultLocale } = useDefaultLocaleContext();

  let message = intl.formatMessage({ id, defaultMessage }, values);

  const props: any = {
    "data-key": id,
  };
  const classNames = ["i18n-message", className, "t"];

  if (message === "") {
    // We need both title and aria-label because otherwise "title"
    // becomes the default "name" of the elemement. An i18n token is still
    // better than nothing
    props["aria-label"] = id;
    props.title = "Cmd/ctrl-click to add missing translation";
    classNames.push(modKeyDown ? "t-modkeydown" : "t-modkeyup");

    const defaultLocaleMessage = stringsRegistry.getString({
      id,
      defaultMessage,
      values,
      messages: defaultLocale?.strings || [],
      locale: defaultLocale?.id || "en-US",
    });

    if (defaultLocaleMessage) {
      // a translation was found, but it's a fallback placeholder
      message = defaultLocaleMessage;
      classNames.push("t-fallback");
    } else {
      // no translation was found
      message = `[${intl.locale}] ${id}`;
      classNames.push("t-missing");
    }
  }

  props.className = classNames.join(" ");

  return html ? (
    <span
      {...props}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(message) }}
    />
  ) : (
    <span {...props}>{message}</span>
  );
};
