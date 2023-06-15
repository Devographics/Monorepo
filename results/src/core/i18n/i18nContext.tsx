import React, { createContext, useContext, useMemo, FC } from 'react'
import { getTranslator, getStringTranslator } from './translator'
import { Locale, LegacyTranslator, StringTranslator } from 'core/types'
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
            getString
        }),
        [locale, translate, getString]
    )

    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export const I18nContextProvider: FC = ({ children }) => {
    return <I18nContextProviderInner>{children}</I18nContextProviderInner>
}

type I18nContextType = {
    locale: Locale
    translate: LegacyTranslator
    getString: StringTranslator
}

export const useI18n = () => useContext(I18nContext) as I18nContextType
