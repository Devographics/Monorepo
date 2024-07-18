import { makeTranslatorFunc, type LocaleParsed } from "@devographics/i18n";

export function astroI18nCtx(localeDict: LocaleParsed) {
    return {
        t: makeTranslatorFunc(localeDict),
        locale: localeDict,
        localizePath: (p: string) => `/${localeDict.id}${p}`,
    }
}