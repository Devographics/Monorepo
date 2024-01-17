import { EditionMetadata, SurveyMetadata } from '@devographics/types'
import React from 'react'
import type { Locale } from "@devographics/react-i18n"

interface GatsbyPageContext {
    id: string
    currentPath: string
    width?: number
    path: string
    basePath: string
    host: string
    titleId: string
    intlId: string
    previous?: PageContextValue
    next?: PageContextValue
    // TODO: actually could be an array too
    children?: React.ReactNode
    pageData: any
}
interface SurveyPageContext {
    isCapturing?: boolean
    isDebugEnabled?: boolean
    chartSponsors?: any
    config?: any
    currentSurvey: SurveyMetadata
    currentEdition: EditionMetadata
    locale?: Locale
    block: any
    locales?: Array<Locale>,
    localePath: string,
    localeId: string
    parent?: any
    i18nNamespaces?: any
}
export type PageContextValue = SurveyPageContext & GatsbyPageContext
