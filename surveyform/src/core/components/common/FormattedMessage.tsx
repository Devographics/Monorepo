import React from "react";
import { useKeydownContext } from "./KeydownContext";
import { useIntlContext } from "@vulcanjs/react-i18n";

const githubOrg = "Devographics";
const localeRepoName = (localeId: string) => `locale-${localeId}`;
/**
 * Returns a GitHub search URL that looks for locale strings
 * in both en repo and current locale repo
 *
 * User can then use the en translation to enhance the current locale repo
 *
 * @param tokenId
 * @param localeId
 * @returns
 */
const getGitHubSearchUrl = (tokenId: string, localeId: string) => {
  const enLocaleRepo = `${githubOrg}/${localeRepoName("en-US")}`;
  const currentLocaleRepo = `${githubOrg}/${localeRepoName(localeId)}`;
  // it's possible to add a path:/common.yml as well
  const query = `${tokenId} repo:${currentLocaleRepo} repo:${enLocaleRepo}`;
  return `https://github.com/search?type=Code&ref=advsearch&l=&l=&q=${encodeURIComponent(
    query
  )}`;
};

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
  // NOTE: it means that a cmd/alt press will rerender all texts
  // we could improve that using refs/a global window variable later on
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
   * Empty tokens can only happen if en-US also misses a new token
   * because for each locale, when a token is missing,
   * the server will use the default (en-US) token
   */
  if (message === "") {
    // We need both title and aria-label because otherwise "title"
    // becomes the default "name" of the elemement. An i18n token is still
    // better than nothing
    props["aria-label"] = id;
    props.title = "Cmd/alt-click to add missing translation";
    classNames.push(modKeyDown ? "t-modkeydown" : "t-modkeyup");
  }
  // Title indicates which elements are translatable when pressing cmd or alt
  // NOTE: cmd/ctrl-click shortcut works for all tokens,
  // so that translators can easily translate fallback english strings
  // or even improve existing translations
  if (modKeyDown) {
    props.title = "Cmd/alt-click to add missing translation";
  }

  props.className = classNames.join(" ");
  return (
    <span
      onClick={handleClick}
      {...props}
      dangerouslySetInnerHTML={{ __html: message }}
    />
  );
};
