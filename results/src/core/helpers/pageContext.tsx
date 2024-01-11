import { PageContextValue } from 'core/types'
import React, { createContext, useContext } from 'react'

const pageContext = createContext<PageContextValue | null>(null)

export const PageContextProvider = ({
    value,
    children
}: {
    value: PageContextValue
    children: React.ReactNode
}) => {
    return <pageContext.Provider value={value}>{children}</pageContext.Provider>
}

export const usePageContext = () => {
    const ctx = useContext(pageContext)
    if (!ctx) throw new Error('Page context not set')
    return ctx
}
