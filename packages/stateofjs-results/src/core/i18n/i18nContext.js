import React, { createContext, useContext, useMemo } from 'react'
import { getTranslator, getStringTranslator } from './translator'
import { usePageContext } from '../helpers/pageContext'

export const I18nContext = createContext()

const I18nContextProviderInner = ({ children }) => {
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

export const I18nContextProvider = ({ children }) => {
    return <I18nContextProviderInner>{children}</I18nContextProviderInner>
}

export const useI18n = () => useContext(I18nContext)
