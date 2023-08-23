import { EditionMetadata, SurveyMetadata } from '@devographics/types'
import React from 'react'
import { Locale } from './i18n'

interface GatsbyPageContext {
    id: string
    currentPath: string,
    width?: number
    path: string,
    basePath: string,
    host: string,
    titleId: string,
    intlId: string,
    previous?: PageContextValue,
    next?: PageContextValue,
    // TODO: actually could be an array too
    children?: React.ReactNode
    pageData: any,
}
interface SurveyPageContext {
    isCapturing?: boolean
    chartSponsors?: any
    config?: any
    currentSurvey: SurveyMetadata
    currentEdition: EditionMetadata
    locale?: Locale
    block: any
    locales?: Array<any>
}
export type PageContextValue = SurveyPageContext & GatsbyPageContext