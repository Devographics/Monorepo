import React from 'react'
import {
    BucketUnits,
    EditionMetadata,
    ResponsesParameters,
    ResultsSubFieldEnum,
    SurveyMetadata
} from '@devographics/types'

/*
@see @devographics/types/data.ts
type BlockUnits =
    | 'count'
    | 'percentageSurvey'
    | 'percentageQuestion'
    | 'percentageFacet'
    | 'percentageBucket'
    | 'average'
type BlockRatioUnits =
    | 'satisfaction_percentage'
    | 'interest_percentage'
    | 'awareness_percentage'
    | 'usage_percentage'
    */
type BlockSetUnits = React.Dispatch<React.SetStateAction<string>>
type BlockMode = 'absolute' | 'relative'

interface BlockComponentProps {
    block: BlockDefinition
}

interface BlockQueryOptions {
    addBucketsEntities?: boolean
    addQuestionEntity?: boolean
    addQuestionComments?: boolean
    subField?: ResultsSubFieldEnum
}

export interface BlockDefinition {
    /**
     * @example browsers
     */
    id: string
    params?: any
    /**
     * Note sure of their role?
     * @example user_info__gender
     */
    facet?: any
    // ?
    fieldId?: string
    template?: string
    blockType?: string
    tabId?: string
    titleId?: string
    descriptionId?: string
    noteId?: string

    defaultUnits?: BucketUnits

    /**
     * Can be:
     * - name of a default query
     * - name of any other query
     * - a complete query (not just the name)
     * The query field seems to be computed when we flatten the sitemap in the reulst app
     */
    query?: 'currentEditionData' | 'allEditionsData' | string
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

interface BlockLegend {
    id: string
    label: string
    shortLabel?: string
    color?: string
    gradientColors: string[]
}

export interface PageContextValue {
    survey: SurveyMetadata
    edition: EditionMetadata
    sectionId: string
    subSectionId?: string
    localeId: string
}
