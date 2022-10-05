import React from "react";
import sanitizeHtml from "sanitize-html";
import { useKeydownContext } from "./KeydownContext";
import { useIntlContext } from "@vulcanjs/react-i18n";
import { stringsRegistry } from "~/i18n";

const getGitHubSearchUrl = (id, localeId) =>
  `https://github.com/search?q=${id}+repo%3AStateOfJS%2Fstate-of-js-graphql-results-api+path%3A%2Fsrc%2Fi18n%2F${localeId}%2F+path%3A%2Fsrc%2Fi18n%2Fen-US%2F&type=Code&ref=advsearch&l=&l=`;

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

  let message = intl.formatMessage({ id, defaultMessage }, values);

  const props: any = {
    "data-key": id,
  };
  const classNames = ["i18n-message", className, "t"];

  const handleClick = (e) => {
    // note: `fallback` here denotes whether a string is itself a fallback for a missing string
    if (modKeyDown) {
      e.preventDefault();
      e.stopPropagation();
      window.open(getGitHubSearchUrl(id, intl.locale));
    }
  };

  /**
   * NOTE: this currently barely ever happens,
   * because for each locale, when a token is missing,
   * the server will use the default (en-US) token
   * Empty tokens can only happen if en-US also misses a new token
   */
  if (message === "") {
    props.onClick = handleClick;
    // We need both title and aria-label because otherwise "title"
    // becomes the default "name" of the elemement. An i18n token is still
    // better than nothing
    props["aria-label"] = id;
    props.title = "Cmd/ctrl-click to add missing translation";
    classNames.push(modKeyDown ? "t-modkeydown" : "t-modkeyup");
  }

  props.className = classNames.join(" ");
  return (
    <span
      {...props}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(message) }}
    />
  );
};
