import { EditionMetadata, SurveyMetadata } from '@devographics/types'
import React from 'react'
import { Locale } from './i18n'

export interface PageDef {
    path: string,

}
export interface PageContextValue {
    id: string
    locale?: Locale
    width?: number
    isCapturing?: boolean
    chartSponsors?: any
    config?: any
    currentSurvey: SurveyMetadata
    currentEdition: EditionMetadata
    pageData: any,
    //
    currentPath: string,
    path: string,
    basePath: string,
    host: string,
    titleId: string,
    intlId: string,
    previous?: PageContextValue,
    next?: PageContextValue,
    //
    block: any
    // 
    locales?: Array<any>
    // TODO: actually could be an array too
    children?: React.ReactNode
}
