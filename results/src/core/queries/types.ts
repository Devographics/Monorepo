import { ResponsesParameters, Filters, Filter } from '@devographics/types'
import { FacetItem } from 'core/filters/types'

export interface ResponseArgumentsStrings {
    facet?: string
    filters?: string
    parameters?: string
    axis1?: string
    axis2?: string
    bucketsFilter?: string
}

export interface SeriesParams {
    name: string
    queryArgs: QueryArgs
}

export interface QueryArgs {
    facet?: FacetItem
    filters?: Filters
    parameters?: ResponsesParameters
    bucketsFilter?: Filter<string>
    xAxis?: string
    yAxis?: string
    fieldId?: string
}

export interface ProvidedQueryOptions {
    allEditions?: boolean
    addBucketsEntities?: boolean
    isLog?: boolean
    addRootNode?: boolean
    addQuestionEntity?: boolean
    addQuestionComments?: boolean
    addRatios?: boolean
    addBuckets?: boolean
    addGroupedBuckets?: boolean
    fieldId?: string
}

export interface QueryOptions extends ProvidedQueryOptions {
    surveyId: string
    editionId: string
    sectionId: string
    questionId: string
    subField?: string
}
