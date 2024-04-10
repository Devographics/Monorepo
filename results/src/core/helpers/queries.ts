import { BlockVariantDefinition } from 'core/types'
import { ResponsesParameters, Filters, BucketUnits, ResultsSubFieldEnum } from '@devographics/types'
import { PageContextValue } from 'core/types/context'
import isEmpty from 'lodash/isEmpty'
import { CustomizationDefinition, CustomizationOptions, FacetItem } from 'core/filters/types'
import { conditionsToFilters } from 'core/filters/helpers'

export const argumentsPlaceholder = '<ARGUMENTS_PLACEHOLDER>'

export const bucketFacetsPlaceholder = '<BUCKETFACETS_PLACEHOLDER>'

export const getEntityFragment = () => `entity {
    name
    nameHtml
    nameClean
    description
    descriptionHtml
    descriptionClean
    id
    type
    example {
      label
      language
      code
      codeHighlighted
    }
    avatar {
      url
    }
    homepage {
      url
    }
    youtube {
      url
    }
    twitter {
      url
    }
    twitch {
      url
    }
    rss {
      url
    }
    blog {
        url
    }
    mastodon {
        url
    }
    github {
        url
    }
    npm {
        url
    }
    mdn {
        url
    }
    caniuse {
        url
    }
    resources {
        url
        title
    }
}`

export const getFacetFragment = (addBucketsEntities?: boolean) => `
    facetBuckets {
        id
        count
        percentageQuestion
        percentageSurvey
        percentageBucket
        hasInsufficientData
        ${addBucketsEntities ? getEntityFragment() : ''}
    }
`

export const getPercentilesFragment = () => `
    percentilesByFacet {
        p0
        p10
        p25
        p50
        p75
        p90
        p100
    }
`

const getCommentsCountFragment = () => `
  comments {
    currentEdition {
      count
    }
  }
`

const allEditionsFragment = `editionId
  year`

// v1: {"foo": "bar"} => {foo: "bar"}
// const unquote = s => s.replace(/"([^"]+)":/g, '$1:')

// v2: {"foo": "bar"} => {foo: bar} (for enums)
const unquote = (s: string) => s.replaceAll('"', '')

const wrapArguments = (args: ResponseArgumentsStrings) => {
    const keys = Object.keys(args)

    return keys.length > 0
        ? `(${keys
              .filter(k => !!args[k as keyof ResponseArgumentsStrings])
              .map(k => `${k}: ${args[k as keyof ResponseArgumentsStrings]}`)
              .join(', ')})`
        : ''
}

interface ResponseArgumentsStrings {
    facet?: string
    filters?: string
    parameters?: string
    axis1?: string
    axis2?: string
}

const facetItemToFacet = ({ sectionId, id }: FacetItem) => `${sectionId}__${id}`

export interface SeriesParams {
    name: string
    queryArgs: QueryArgs
}

export interface QueryArgs {
    facet?: FacetItem
    filters?: Filters
    parameters?: ResponsesParameters
    xAxis?: string
    yAxis?: string
    fieldId?: string
}
export const getQueryArgsString = ({
    facet,
    filters,
    parameters,
    xAxis,
    yAxis
}: QueryArgs): string | undefined => {
    const args: ResponseArgumentsStrings = {}
    if (facet) {
        args.facet = facetItemToFacet(facet)
    }
    if (filters && !isEmpty(filters)) {
        args.filters = unquote(JSON.stringify(filters))
    }
    if (parameters && !isEmpty(parameters)) {
        args.parameters = unquote(JSON.stringify(parameters))
    }
    // for data explorer
    if (yAxis && !isEmpty(yAxis)) {
        args.axis1 = yAxis
    }
    if (xAxis && !isEmpty(xAxis)) {
        args.axis2 = xAxis
    }
    if (isEmpty(args)) {
        return ''
    } else {
        return wrapArguments(args)
    }
}

export interface ProvidedQueryOptions {
    allEditions?: boolean
    addBucketsEntities?: boolean
    addArgumentsPlaceholder?: boolean
    addBucketFacetsPlaceholder?: boolean
    isLog?: boolean
    addRootNode?: boolean
    addQuestionEntity?: boolean
    addQuestionComments?: boolean
    addGroupedBuckets?: boolean
    fieldId?: string
}

interface QueryOptions extends ProvidedQueryOptions {
    surveyId: string
    editionId: string
    sectionId: string
    questionId: string
    subField?: string
}

const getBucketFragment = (options: {
    addBucketsEntities: boolean
    addBucketFacetsPlaceholder: boolean
    queryArgs: QueryArgs
    addGroupedBuckets: boolean
}): string => {
    const { addBucketsEntities, addBucketFacetsPlaceholder, queryArgs, addGroupedBuckets } = options
    const { facet } = queryArgs
    return `
                    count
                    id
                    percentageQuestion
                    percentageSurvey
                    hasInsufficientData
                    ${addBucketsEntities ? getEntityFragment() : ''}
                    ${facet || addBucketFacetsPlaceholder ? BucketUnits.AVERAGE : ''}
                    ${facet || addBucketFacetsPlaceholder ? getPercentilesFragment() : ''}
                    ${facet ? getFacetFragment(addBucketsEntities) : ''}
                    ${addBucketFacetsPlaceholder ? bucketFacetsPlaceholder : ''}
                    ${
                        addGroupedBuckets
                            ? `groupedBuckets {
                        ${getBucketFragment({ ...options, addGroupedBuckets: false })}
                    }
                    `
                            : ''
                    }
`
}

export const getDefaultQuery = ({
    queryOptions,
    series
}: {
    queryOptions: QueryOptions
    series: SeriesParams[]
}) => {
    const { surveyId, editionId, sectionId } = queryOptions

    return `
query {
    surveys {
    ${surveyId} {
        ${editionId} {
        ${sectionId} {
            ${series.map(serie => getSerieFragment({ queryOptions, serie }))}
        }
        }
    }
    }
}
`
}

const getSerieFragment = ({
    queryOptions,
    serie
}: {
    queryOptions: QueryOptions
    serie: SeriesParams
}) => {
    const { name, queryArgs } = serie
    const {
        questionId,
        subField = 'responses',
        addBucketsEntities = true,
        allEditions = false,
        addArgumentsPlaceholder = false,
        addBucketFacetsPlaceholder = false,
        addQuestionEntity = false,
        addQuestionComments = false,
        addGroupedBuckets = false
    } = queryOptions
    const queryArgsString = addArgumentsPlaceholder
        ? argumentsPlaceholder
        : getQueryArgsString(queryArgs)
    const editionType = allEditions ? 'allEditions' : 'currentEdition'

    const questionIdString = name ? `${name}: ${questionId}` : questionId

    return `
        ${questionIdString} {
            ${addQuestionEntity ? getEntityFragment() : ''}
            ${addQuestionComments ? getCommentsCountFragment() : ''}
            ${subField}${queryArgsString} {
            ${editionType} {
                ${allEditions ? allEditionsFragment : ''}
                completion {
                count
                percentageSurvey
                total
                }
                buckets {
                ${getBucketFragment({
                    addBucketFacetsPlaceholder,
                    addBucketsEntities,
                    addGroupedBuckets,
                    queryArgs
                })}
                }
            }
            }
        }`
}

export const getParameters = (options: CustomizationOptions) => {
    const parameters: ResponsesParameters = {}
    const { cutoff, cutoffType, limit, mergeOtherBuckets } = options
    if (options.cutoff) {
        if (cutoffType === 'percent') {
            // use same cutoff value for both
            parameters.cutoffPercent = cutoff
            parameters.facetCutoffPercent = cutoff
        } else {
            parameters.cutoff = cutoff
            parameters.facetCutoff = cutoff
        }
    }
    if (limit) {
        parameters.limit = limit
    }
    if (mergeOtherBuckets) {
        parameters.mergeOtherBuckets = mergeOtherBuckets
    }
    return parameters
}
/*

For a given block and pageContext, generate query and query options and return result

*/
export const getBlockQuery = ({
    block,
    pageContext,
    chartFilters
}: {
    chartFilters?: CustomizationDefinition
    block: BlockVariantDefinition
    pageContext: PageContextValue
}) => {
    const { facet, filters, options = {} } = chartFilters || {}
    const { showDefaultSeries } = options
    const questionId = block.fieldId || block.id
    const queryOptions = {
        surveyId: pageContext?.currentSurvey?.id,
        editionId: pageContext?.currentEdition?.id,
        sectionId: pageContext?.id,
        questionId,
        subField: block?.queryOptions?.subField || ResultsSubFieldEnum.RESPONSES
    }
    let parameters = block.parameters
    if (options) {
        parameters = getParameters(options)
    }
    const defaultQueryArgs = {
        facet,
        parameters
    }
    const defaultSeriesName = facet ? `${questionId}_by_${facet.id}` : questionId
    const defaultSeries = { name: defaultSeriesName, queryArgs: defaultQueryArgs }
    let series: SeriesParams[]
    if (filters && filters.length > 0) {
        series = [
            ...(showDefaultSeries ? [defaultSeries] : []),
            ...filters.map((filter, filterIndex) => {
                const { conditions } = filter
                const filters = conditionsToFilters(conditions)
                const name = `${defaultSeriesName}_${filterIndex + 1}`
                return { name, queryArgs: { ...defaultQueryArgs, filters } }
            })
        ]
    } else {
        series = [defaultSeries]
    }
    return {
        query: getDefaultQuery({ queryOptions, series }),
        seriesNames: series.map(s => s.name)
    }
}
