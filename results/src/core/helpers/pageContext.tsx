import { Locale } from 'core/i18n/translator'
import React, { createContext, useContext, FC } from 'react'

interface PageContextValue {
    locale?: Locale
    width?: number
    isCapturing?: boolean
    chartSponsors?: any
    config?: any
    currentSurvey?: any
    currentEdition?: any
}

const pageContext = createContext({})

export const PageContextProvider: FC<{ value: PageContextValue, children: React.ReactNode }> = ({
    value,
    children
}) => {
    return <pageContext.Provider value={value}>{children}</pageContext.Provider>
}

export const usePageContext = () => useContext<PageContextValue>(pageContext)
