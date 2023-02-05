type TokensMap = {
    [token: string]: string
}
type StringsMap = {
    [localeId: string]: TokensMap
}

export class StringsRegistry {
    Strings: StringsMap
    defaultLocaleId: string
    constructor(defaultLocaleId: string) {
        this.Strings = {}
        this.defaultLocaleId = defaultLocaleId
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
        Object.entries(sr.Strings).forEach(
            ([localeId, tokens]) => {
                this.addStrings(localeId, tokens)
            }
        )
    }
    /**
     * Get a specific translation
     * @param param0 
     * @returns 
     */
    getString({ id, values, defaultMessage, localeId }: {
        /** token */
        id: string,
        values: any,
        defaultMessage?: string,
        localeId: string
    }) {
        const { Strings, defaultLocaleId } = this
        let message = "";
        if (Strings[localeId] && Strings[localeId][id]) {
            message = Strings[localeId][id];
        } else if (Strings[defaultLocaleId] && Strings[defaultLocaleId][id]) {
            // debug(`\x1b[32m>> INTL: No string found for id "${id}" in locale "${locale}", using defaultLocale "${defaultLocale}".\x1b[0m`);
            message = Strings[defaultLocaleId] && Strings[defaultLocaleId][id];
        } else if (defaultMessage) {
            // debug(`\x1b[32m>> INTL: No string found for id "${id}" in locale "${locale}", using default message "${defaultMessage}".\x1b[0m`);
            message = defaultMessage;
        }
        if (values && typeof values === "object") {
            Object.keys(values).forEach((key) => {
                // es2021 syntax
                message = (message as any).replaceAll(`{${key}}`, values[key]); // TODO: false positive on replaceAll not existing in TS
            });
        }
        return message;
    };
    /**
     * Get all the strings for a locale
     * @param localeId 
     * @returns 
     */
    getStrings(localeId) {
        return this.Strings[localeId];
    }

};