import React, { createContext, useContext, FC } from 'react'
import { PageContextValue } from '@types/index'

const pageContext = createContext({})

export const PageContextProvider: FC<{ value: PageContextValue; children: React.ReactNode }> = ({
    value,
    children
}) => {
    return <pageContext.Provider value={value}>{children}</pageContext.Provider>
}

export const usePageContext = () => useContext<PageContextValue>(pageContext)
