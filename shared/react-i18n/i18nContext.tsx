"use client"
import React, { createContext, useContext, useMemo } from 'react'
import { LocaleParsed, makeTranslationFunction, makeTranslatorFunc, type Locale, type StringTranslator } from '@devographics/i18n'

export const I18nContext = createContext<I18nContextType | null>(null)

export const I18nContextProvider = ({
    children,
    locale
}: {
    children: React.ReactNode
    locale: LocaleParsed
}) => {
    const translate = makeTranslatorFunc(locale)
    const { t, getMessage } = makeTranslationFunction(locale)

    // useMemo because the value is an object
    const value = useMemo(
        () => ({
            locale,
            getString: translate,
            translate,
            t,
            getMessage

        }),
        [locale, translate]
    )
    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

type I18nContextType = {
    locale: Locale
    /** @deprecated use "t" or "getMessage" */
    getString: StringTranslator
    /** @deprecated  use "t" or "getMessage" */
    translate: StringTranslator,
    t: ReturnType<typeof makeTranslationFunction>["t"],
    getMessage: ReturnType<typeof makeTranslationFunction>["getMessage"],
}

export const useTeapot = () => {
    const ctx = useContext(I18nContext)
    if (!ctx) throw new Error("Can't call useTeapot before I18nContextProvider is set")
    return ctx
}
