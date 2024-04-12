import type { PageDefinition } from '@/lib/sitemap'
import React, { createContext, useContext } from 'react'

/**
 * Keep in track with astro.locals in env.d.ts
 */
export interface PageContextValue {
    pageDefinition: PageDefinition
}

const PageContext = createContext<PageContextValue | null>(null)

export const PageContextProvider = ({
    pageContext,
    children
}: {
    pageContext: PageContextValue
    children: React.ReactNode
}) => {
    return <PageContext.Provider value={pageContext}>{children}</PageContext.Provider>
}

export const usePageContext = () => {
    const ctx = useContext(PageContext)
    if (!ctx) throw new Error('Page context not set')
    return ctx
}
