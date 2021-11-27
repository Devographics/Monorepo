import React, { createContext, useContext, useMemo, FC } from 'react'
import {
    getTranslator,
    getStringTranslator,
    Locale,
    LegacyTranslator,
    StringTranslator,
} from './translator'
import { usePageContext } from '../helpers/pageContext'

export const I18nContext = createContext({})

const I18nContextProviderInner: FC = ({ children }) => {
    const context = usePageContext()
    const { locale = {} } = context
    const translate = getTranslator(locale)
    const getString = getStringTranslator(locale)

    const value = useMemo(
        () => ({
            locale,
            translate,
            getString,
        }),
        [locale, translate, getString]
    )

    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export const I18nContextProvider: FC = ({ children }) => {
    return <I18nContextProviderInner>{children}</I18nContextProviderInner>
}

export const useI18n = () =>
    useContext<{
        locale?: Locale
        translate?: LegacyTranslator
        getString?: StringTranslator
    }>(I18nContext)
