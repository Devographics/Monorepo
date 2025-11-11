import { ResponsesParameters, Filters, Filter } from './imports'
import { FacetItem } from './imports'

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
    editionsCount?: number
    addBucketsEntities?: boolean
    isLog?: boolean
    addRootNode?: boolean
    addQuestionEntity?: boolean
    addQuestionComments?: boolean
    addRatios?: boolean
    addBuckets?: boolean
    addGroupedBuckets?: boolean
    addNestedBuckets?: boolean
    fieldId?: string
}

export interface QueryOptions extends ProvidedQueryOptions {
    surveyId: string
    editionId: string
    sectionId: string
    questionId: string
    subField?: string
}
