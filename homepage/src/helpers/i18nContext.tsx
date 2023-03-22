import React, { createContext, useContext } from 'react'
import { getStringTranslator, Locale, StringTranslator, i18nContextType } from './translator'

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

export const I18nContextProvider = ({ locale, locales, children }) => {
    const getString = getStringTranslator(locale)

    const value = {
        locale,
        locales,
        // translate,
        getString,
        foo: 4356
    }

    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export const useI18n = () => {
    return useContext<{
        locale?: Locale
        locales?: Locale[]
        getString?: StringTranslator
    }>(I18nContext)
}
