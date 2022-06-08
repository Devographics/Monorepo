import React, { createContext, useContext, FC } from 'react'
import {
    getTranslator,
    getStringTranslator,
    Locale,
    LegacyTranslator,
    StringTranslator,
    i18nContextType
} from './translator'

const dummyContext: i18nContextType = {
    locale: { id: 'en-US', label: 'English' },
    locales: [
        { id: 'en-US', label: 'English' },
        { id: 'es-ES', label: 'Español' }
    ],
    getString: (x: string) => ({
        t: x,
        tHtml: x,
        fallback: x,
        locale: { id: 'en-US', label: 'English' }
    })
}

export const I18nContext = createContext(dummyContext)
// export const I18nContext = createContext({})

export const I18nContextProvider = ({ locale, locales, children }) => {
    const translate = getTranslator(locale)
    const getString = getStringTranslator(locale)

    const value = {
        locale,
        locales,
        // translate,
        getString,
        foo: 4356
    }

    console.log(`locales count: ${locales.length}`)

    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export const useI18n = () => {
    console.log(I18nContext)
    return useContext<{
        locale?: Locale
        locales?: Locale[]
        getString?: StringTranslator
    }>(I18nContext)
}
