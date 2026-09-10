import { EditionMetadata, SurveyMetadata } from '@devographics/types'
import React from 'react'
import type { Locale } from '@devographics/react-i18n'
import { BlockDefinition, BlockVariantDefinition } from './block'
import { SponsorOrder, SponsorProduct } from './sponsors'

/**
 * A block whose build-time GraphQL query failed. Collected by `runPageQueries`
 * and carried through the page context so the block can show what went wrong,
 * instead of rendering as an indistinguishable "no available data".
 */
export interface BlockQueryError {
    blockId: string
    sectionId: string
    /** `parse`: the generated query is not valid GraphQL, so it was never sent.
     *  `query`: the API was reached and rejected the query or returned no data. */
    type: 'parse' | 'query'
    message: string
    /** Whatever errors the API returned, when it got far enough to return any */
    errors?: Array<{ message: string; path?: Array<string | number> }>
    /** The query as generated, so the error can be read against it */
    query?: string
}

/** Build-time query errors for a page, keyed by block variant id */
export type BlockQueryErrors = { [blockId: string]: BlockQueryError }

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
    /** Empty (or absent) when every block on the page queried successfully */
    blockErrors?: BlockQueryErrors
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
