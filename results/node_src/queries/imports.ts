export interface ResponsesParameters {
    cutoff?: number
    cutoffPercent?: number
    limit?: number
    sort?: SortSpecifier

    facetCutoff?: number
    facetCutoffPercent?: number
    facetLimit?: number
    facetSort?: SortSpecifier

    enableCache?: boolean
    showNoAnswer?: boolean
    mergeOtherBuckets?: boolean
}

export interface SortSpecifier {
    property: SortProperty
    order: SortOrder
}

export const sortProperties = {
    OPTIONS: 'options',
    COUNT: 'count',
    PERCENT: 'percent',
    ID: 'id',
    AVERAGE_BY_FACET: 'averageByFacet',
    MEAN: 'mean'
} as const

export type SortProperty = (typeof sortProperties)[keyof typeof sortProperties]

export type SortOrder = 'asc' | 'desc'
export type SortOrderNumeric = 1 | -1

export interface Filters {
    [key: string]: Filter<string>
}

export enum OperatorEnum {
    // must equal value
    EQ = 'eq',
    // must be one of given values
    IN = 'in',
    // must not be one of given values
    NIN = 'nin'
}

export interface Filter<T> {
    eq?: T
    in?: T[]
    nin?: T[]
    lt?: T
    gt?: T
    hasTags?: T[]
}

export enum BucketUnits {
    COUNT = 'count',
    // PERCENTAGE_FACET = 'percentageFacet',
    PERCENTAGE_QUESTION = 'percentageQuestion',
    PERCENTAGE_SURVEY = 'percentageSurvey',
    PERCENTAGE_BUCKET = 'percentageBucket',
    AVERAGE = 'averageByFacet',
    MEDIAN = 'medianByFacet',
    /**
     * Will favour a box plot instead of bars
     */
    PERCENTILES = 'percentilesByFacet'
}

// export type FacetItem = Pick<QuestionMetadata, 'id' | 'sectionId' | 'optionsAreSequential'>
export type FacetItem = any

export const SENTIMENT_FACET = '_sentiment'

export type BlockVariantDefinition = any

export type PageContextValue = any

export type CustomizationDefinition = any

export type CustomizationOptions = any

export type CustomizationFiltersCondition = any

export const conditionsToFilters = (conditions: CustomizationFiltersCondition[]) => {
    const filters: Filters = {}
    conditions.forEach(condition => {
        const { sectionId, fieldId, operator, value } = condition
        filters[`${sectionId}__${fieldId}`] = { [operator]: value }
    })
    return filters
}

export type SurveyMetadata = any
export type EditionMetadata = any
export type SectionMetadata = any

export enum ResultsSubFieldEnum {
    RESPONSES = 'responses',
    COMMENTS = 'comments',
    FOLLOWUPS = 'followups',
    FREEFORM = 'freeform',
    COMBINED = 'combined',
    PRENORMALIZED = 'prenormalized',
    MEDIANS = 'medians',
    OPTIONS = 'options',
    ENTITY = 'entity',
    ID = 'id',
    METADATA = '_metadata'
}
