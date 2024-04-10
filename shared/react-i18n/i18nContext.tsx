import React, { createContext, useContext, useMemo } from 'react'
import { getTranslator, getStringTranslator } from './translator'
import { Locale, LegacyTranslator, StringTranslator } from '@devographics/i18n'

export const I18nContext = createContext<I18nContextType | null>(null)

export const I18nContextProvider = ({
    children,
    locale
}: {
    children: React.ReactNode
    locale: Locale
}) => {
    const translate = getTranslator(locale)
    const getString = getStringTranslator(locale)

    // useMemo because the value is an object
    const value = useMemo(
        () => ({
            locale,
            translate,
            getString
        }),
        [locale, translate, getString]
    )
    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

type I18nContextType = {
    locale: Locale
    translate: LegacyTranslator
    getString: StringTranslator
}

export const useI18n = () => {
    const ctx = useContext(I18nContext)
    if (!ctx) throw new Error("Can't call useI18n before I18nContextProvider is set")
    return ctx
}
