import { EditionMetadata, SurveyMetadata } from '@devographics/types'
import React from 'react'
import type { Locale } from '@devographics/react-i18n'
import { BlockDefinition, BlockVariantDefinition } from './block'
import { SponsorOrder, SponsorProduct } from './sponsors'

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
    chartSponsors?: {
        products?: Array<SponsorProduct>
        orders?: Array<SponsorOrder>
    }
    config?: any
    allSurveys: SurveyMetadata[]
    currentSurvey: SurveyMetadata
    currentEdition: EditionMetadata
    locale?: Locale
    block: any
    blocks?: Array<BlockDefinition>
    locales?: Array<Locale>
    localePath: string
    localeId: string
    parent?: any
    i18nNamespaces?: any
    // Block page
    showTitle?: boolean
    is_hidden?: boolean
}
export type PageContextValue = SurveyPageContext & GatsbyPageContext
