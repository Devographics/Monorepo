"use client"
import React, { createContext, useContext, useMemo } from 'react'
import { LocaleParsed, LocaleWithStrings, makeTranslationFunction, makeTranslatorFunc, type Locale, type StringTranslator } from '@devographics/i18n'

export const I18nContext = createContext<I18nContextType | null>(null)

/**
 * Will merge locale with any existing locale from a context higher up
 * This way, common locales can be loaded from top-level layout,
 * and survey specific locales are only added to this layout
 * @param param0 
 * @returns 
 */
export const I18nContextProvider = ({
    children,
    locale
}: {
    children: React.ReactNode
    locale: LocaleParsed
}) => {
    // merge with an existing context upper in the hierarchy
    // TODO: we could have a smarter strategy,
    // where "getString" can get a string from a list of locales rather than a single merged locale
    const parentCtx = useContext(I18nContext)
    const localeFromParent = parentCtx?.locale
    let mergedLocale = locale
    if (localeFromParent) {
        mergedLocale = {
            ...localeFromParent,
            ...locale,
            strings: [...(localeFromParent.strings || []), ...(locale.strings || [])],
            dict: { ...localeFromParent.dict, ...locale.dict }
        }
    }

    const getString = makeTranslatorFunc(mergedLocale)
    const { t, getMessage } = makeTranslationFunction(mergedLocale)

    // useMemo because the value is an object
    const value = useMemo(
        () => ({
            locale: mergedLocale,
            getString,
            //@ts-ignore
            translate: (...args) => getString(...args)?.t,
            t,
            getMessage

        }),
        [mergedLocale, getString]
    )
    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

type I18nContextType = {
    locale: LocaleParsed
    /** @deprecated use "t" or "getMessage" */
    getString: StringTranslator
    /** @deprecated  use "t" or "getMessage" */
    translate: (key: string, opts?: { values?: Record<string, any> }, fallback?: boolean) => string,
    t: ReturnType<typeof makeTranslationFunction>["t"],
    getMessage: ReturnType<typeof makeTranslationFunction>["getMessage"],
}

export const useTeapot = () => {
    const ctx = useContext(I18nContext)
    if (!ctx) throw new Error("Can't call useTeapot before I18nContextProvider is set")
    return ctx
}
/** Alias for non-fancy people */
export const useI18n = useTeapot
