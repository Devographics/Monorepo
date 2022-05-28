import React, { createContext, useContext, FC } from 'react'
import {
    getTranslator,
    getStringTranslator,
    Locale,
    LegacyTranslator,
    StringTranslator
} from './translator'

export const I18nContext = createContext({})

export const I18nContextProvider: FC<{ locale: any; children: React.ReactNode }> = ({
    locale,
    children
}) => {
    const translate = getTranslator(locale)
    const getString = getStringTranslator(locale)

    const value = {
        locale,
        translate,
        getString,
        foo: 4356
    }
    
    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export const useI18n = () =>
    useContext<{
        locale?: Locale
        translate?: LegacyTranslator
        getString?: StringTranslator
    }>(I18nContext)
