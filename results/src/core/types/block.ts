import React, { FC } from 'react'
import { PageContextValue } from '@types/context'
import { BucketUnits, ResponsesParameters, ResultsSubFieldEnum } from '@devographics/types'

export type BlockUnits =
    | 'count'
    | 'percentageSurvey'
    | 'percentageQuestion'
    | 'percentageFacet'
    | 'percentageBucket'
    | 'average'
export type BlockRatioUnits =
    | 'satisfaction_percentage'
    | 'interest_percentage'
    | 'awareness_percentage'
    | 'usage_percentage'
export type BlockSetUnits = React.Dispatch<React.SetStateAction<string>>
export type BlockMode = 'absolute' | 'relative'

export interface BlockComponentProps {
    block: BlockDefinition
    context: PageContextValue
}

export interface BlockQueryOptions {
    addBucketsEntities?: boolean
    addQuestionEntity?: boolean
    addQuestionComments?: boolean
    subField?: ResultsSubFieldEnum
}

export interface BlockDefinition {
    id: string
    fieldId?: string
    sectionId: string
    template?: string
    blockType?: string
    tabId?: string
    titleId?: string
    descriptionId?: string
    noteId?: string

    defaultUnits?: BucketUnits

    // data
    query?: string
    variables?: any
    parameters: ResponsesParameters
    filters?: FilterType[]
    queryOptions?: BlockQueryOptions

    // config
    mode?: BlockMode
    // will default to the id of the chart
    i18nNamespace?: string
    colorVariant?: string
    overrides?: object

    // booleans
    legendPosition?: 'bottom' | 'top'
    translateData?: boolean
    hasSponsor?: boolean
    hasComments?: boolean
}

type FilterType = 'filters' | 'facets'

export interface BlockLegend {
    id: string
    label: string
    shortLabel?: string
    color?: string
    gradientColors: string[]
}
