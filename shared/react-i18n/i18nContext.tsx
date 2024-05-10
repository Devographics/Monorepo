import React, { createContext, useContext, useMemo } from 'react'
import { makeTranslatorFunc, type Locale, type StringTranslator } from '@devographics/i18n'

export const I18nContext = createContext<I18nContextType | null>(null)

export const I18nContextProvider = ({
    children,
    locale
}: {
    children: React.ReactNode
    locale: Locale
}) => {
    const translate = makeTranslatorFunc(locale)

    // useMemo because the value is an object
    const value = useMemo(
        () => ({
            locale,
            getString: translate,
            translate,
        }),
        [locale, translate]
    )
    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

type I18nContextType = {
    locale: Locale
    getString: StringTranslator
    /** @deprecated courtesy for results app migration */
    translate: StringTranslator
}

export const useI18n = () => {
    const ctx = useContext(I18nContext)
    if (!ctx) throw new Error("Can't call useI18n before I18nContextProvider is set")
    return ctx
}
