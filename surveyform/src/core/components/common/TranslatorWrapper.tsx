"use client";
import React, { useEffect, useState } from "react";
import { useKeydownContext } from "./KeydownContext";
import { useIntlContext } from "@devographics/react-i18n";
import { useLocaleContext } from "~/i18n/context/LocaleContext";

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

/**
 * Translator mode is enabled by setting the TRANSLATOR localStorage value
 * to something that is truthy eg "1"
 * (and refreshing the page until we update to React 18 useSyncExternalStore)
 * @returns
 */
export const useTranslatorMode = () => {
  // TODO: can be improved with "useSyncExternalStore" and listen on "storage" event
  // need React 18 though
  const [isTranslator, setIsTranslator] = useState(false);
  useEffect(() => {
    const isTranslatorEnabled = !!localStorage.getItem("TRANSLATOR");
    if (isTranslatorEnabled !== isTranslator) {
      setIsTranslator(isTranslatorEnabled);
    }
  }, []);
  return isTranslator;
};

export const TranslatorWrapper = ({
  id,
  message,
  children,
}: {
  id: string;
  message: string;
  children: React.ReactNode;
}) => {
  const { localeId } = useLocaleContext();
  const intl = useIntlContext();
  // modKey = cmd or alt
  const { modKeyDown } = useKeydownContext();
  const shouldRedirectToTranslation = modKeyDown;
  const handleClick = (e) => {
    if (!shouldRedirectToTranslation) return;
    // note: `fallback` here denotes whether a string is itself a fallback for a missing string
    e.preventDefault();
    e.stopPropagation();
    window.open(getGitHubSearchUrl(id, localeId));
  };

  const title = shouldRedirectToTranslation
    ? "Cmd/alt-click to add missing translation"
    : undefined;
  // When there is no message, also set an aria-label
  // otherwise the title will become the element accessible name
  // Empty tokens can only happen if en-US also misses a new token
  // because for each locale, when a token is missing,
  // the server will use the default (en-US) token
  const ariaLabel = !message ? id : undefined;
  const className = modKeyDown ? "t-modkeydown" : "t-modkeyup";
  return (
    <span
      className={className}
      title={title}
      aria-label={ariaLabel}
      onClick={handleClick}
    >
      {children}
    </span>
  );
};
