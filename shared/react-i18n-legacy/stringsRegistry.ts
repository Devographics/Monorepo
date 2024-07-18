export enum TokenType {
  REGULAR = "regular",
  DEFAULT_LOCALE_FALLBACK = "default_locale_fallback",
  DEFAULT_MESSAGE_FALLBACK = "default_message_fallback",
  KEY_FALLBACK = "key_fallback",
}
export type I18nToken = {
  key: string;
  t: string;
  tClean?: null | string;
  tHtml?: null | string;
  type: TokenType;
};

export type TokensMap = {
  [token: string]: I18nToken;
};
export type StringsMap = {
  [localeId: string]: TokensMap;
};

/**
 * Helper that can be used on the fly, server side
 * 1) get message in current locale
 * 2) if not found get in default locale (usuall en-US)
 * 3) if not found get default message
 * 4) if not found empty string
 * @param param0
 * @returns
 */
function getFormattedString({
  id,
  values,
  defaultMessage,
  localeId,
  defaultLocaleId,
  Strings,
}: {
  /** token */
  id: string;
  values?: { [key: string]: string | number };
  defaultMessage?: string;
  localeId: string;
  defaultLocaleId: string;
  Strings: StringsMap;
}) {
  let message: I18nToken;
  if (Strings[localeId] && Strings[localeId][id]) {
    message = Strings[localeId][id];
    message.type = TokenType.REGULAR;
  } else if (Strings[defaultLocaleId] && Strings[defaultLocaleId][id]) {
    // debug(`\x1b[32m>> INTL: No string found for key "${id}" in locale "${locale}", using defaultLocale "${defaultLocale}".\x1b[0m`);
    message = Strings[defaultLocaleId] && Strings[defaultLocaleId][id];
    message.type = TokenType.DEFAULT_LOCALE_FALLBACK;
  } else if (defaultMessage) {
    // debug(`\x1b[32m>> INTL: No string found for key "${id}" in locale "${locale}", using default message "${defaultMessage}".\x1b[0m`);
    message = {
      key: "default",
      t: defaultMessage,
      type: TokenType.DEFAULT_MESSAGE_FALLBACK,
    };
  } else {
    // debug(`\x1b[32m>> INTL: No string found for key "${id}" in locale "${locale}", using key as fallback.\x1b[0m`);
    message = { key: "key-fallback", t: id, type: TokenType.KEY_FALLBACK };
  }
  if (values && typeof values === "object") {
    Object.keys(values).forEach((key) => {
      // es2021 syntax
      if (typeof message === "string") {
        message = (message as any)?.replaceAll(`{${key}}`, values[key]); // TODO: false positive on replaceAll not existing in TS
      } else {
        // @ts-ignore TODO: sometimes messages are string, sometimes not
        message.t = (message as any)?.t?.replaceAll(`{${key}}`, values[key]); // TODO: false positive on replaceAll not existing in TS
      }
    });
  }
  if (!message.tHtml) {
    message.tHtml = message.t;
  }
  if (!message.tClean) {
    message.tClean = message.t;
  }
  // @ts-ignore message should normally already be a "string" but this functions is not working as expected and gets the whole object
  return message;
}

export class StringsRegistry {
  Strings: StringsMap;
  defaultLocaleId: string;
  constructor(defaultLocaleId: string) {
    this.Strings = {};
    this.defaultLocaleId = defaultLocaleId;
  }
  /**
   * Feed the Strings map with more tokens
   * @param localeId
   * @param strings
   */
  addStrings(localeId: string, strings: TokensMap): void {
    if (typeof this.Strings[localeId] === "undefined") {
      this.Strings[localeId] = {};
    }
    this.Strings[localeId] = {
      ...this.Strings[localeId],
      ...strings,
    };
  }
  // fill from  a parent registry
  mergeTokens(sr: StringsRegistry) {
    Object.entries(sr.Strings).forEach(([localeId, tokens]) => {
      this.addStrings(localeId, tokens);
    });
  }
  /**
   * Get a specific translation
   * @param param0
   * @returns
   */
  getString({
    id,
    values,
    defaultMessage,
    localeId,
  }: {
    /** token */
    id: string;
    values?: { [key: string]: string };
    defaultMessage?: string;
    localeId: string;
  }) {
    const { Strings, defaultLocaleId } = this;
    return getFormattedString({
      id,
      values,
      defaultMessage,
      localeId,
      defaultLocaleId,
      Strings,
    });
  }
  /**
   * Get all the strings for a locale
   * @param localeId
   * @returns
   */
  getStrings(localeId: string) {
    return this.Strings[localeId];
  }
}
