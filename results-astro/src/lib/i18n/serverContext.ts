import { makeTranslatorFunc, type LocaleWithStrings } from "@devographics/i18n";

export function astroI18nCtx(localeWithStrings: LocaleWithStrings) {
    return {
        t: makeTranslatorFunc(localeWithStrings),
        locale: localeWithStrings,
        localizePath: (p: string) => `/${localeWithStrings.id}${p}`,
    }
}