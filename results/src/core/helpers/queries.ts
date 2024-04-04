import { BlockVariantDefinition } from 'core/types'
import camelCase from 'lodash/camelCase.js'
import { indentString } from './utils'
import { ResponsesParameters, Filters, BucketUnits } from '@devographics/types'
import { PageContextValue } from 'core/types/context'
import isEmpty from 'lodash/isEmpty'
import { FacetItem } from 'core/filters/types'

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

export interface QueryArgs {
    facet?: FacetItem
    filters?: Filters
    parameters?: ResponsesParameters
    xAxis?: string
    yAxis?: string
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
    queryArgs = {}
}: {
    queryOptions: QueryOptions
    queryArgs?: QueryArgs
}) => {
    const {
        surveyId,
        editionId,
        sectionId,
        questionId,
        fieldId,
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

    const questionIdString = fieldId ? `${questionId}: ${fieldId}` : questionId

    return `
surveys {
  ${surveyId} {
    ${editionId} {
      ${sectionId} {
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
        }
      }
    }
  }
}
`
}

export const getQueryName = ({
    editionId,
    questionId
}: {
    editionId: string
    questionId: string
}) => `${camelCase(editionId)}${camelCase(questionId)}Query`

/*

Wrap query contents with query FooQuery {...}

*/
export const wrapQuery = ({
    queryName,
    queryContents,
    addRootNode = false
}: {
    queryName: string
    queryContents: string
    addRootNode?: boolean
}) => {
    if (addRootNode) {
        return `query ${queryName} {
    dataAPI{
        ${indentString(queryContents, 8)}
    }
}`
    } else {
        return `query ${queryName} {
    ${indentString(queryContents, 4)}
}`
    }
}

/*

Get query by either

A) generating a default query based on presets

or

B) using query defined in block template definition

*/
const defaultQueries = ['currentEditionData', 'allEditionsData']

/*

For a given block and pageContext, generate query and query options and return result

*/
export const getBlockQuery = ({
    block,
    pageContext,
    queryOptions: providedQueryOptions = {},
    queryArgs = {}
}: {
    block: BlockVariantDefinition
    pageContext?: PageContextValue
    queryOptions?: ProvidedQueryOptions
    // isLog?: boolean
    // enableCache?: boolean
    // addArgumentsPlaceholder?: boolean
    // addBucketFacetsPlaceholder?: boolean
    queryArgs?: QueryArgs
}) => {
    let stringQuery
    const { query, queryOptions: blockQueryOptions } = block

    const defaultQueryOptions = {
        surveyId: pageContext?.currentSurvey?.id,
        editionId: pageContext?.currentEdition?.id,
        sectionId: pageContext?.id,
        questionId: block.id
    }
    const maybeQueryOptions = {
        ...defaultQueryOptions,
        ...providedQueryOptions,
        ...blockQueryOptions
    }

    if (!maybeQueryOptions.surveyId) throw new Error('Missing surveyId in queryOptions')
    if (!maybeQueryOptions.editionId) throw new Error('Missing editionId in queryOptions')
    const queryOptions = maybeQueryOptions as QueryOptions

    if (!query) {
        stringQuery = ''
    } else {
        stringQuery = getQuery({ query, queryOptions, queryArgs })
    }
    return stringQuery
}

/*

Take query, queryOptions, and queryArgs, and return full query

*/
export const getQuery = ({
    query,
    queryOptions,
    // isLog = false,
    // enableCache = false,
    queryArgs
}: {
    query: string
    queryOptions: QueryOptions
    // isLog?: boolean
    // enableCache?: boolean
    queryArgs?: QueryArgs
}) => {
    let queryContents

    const { isLog, addArgumentsPlaceholder } = queryOptions

    if (isLog) {
        // when logging we can leave out enableCache parameter
        delete queryArgs?.parameters?.enableCache
    }

    const { editionId, questionId } = queryOptions
    const queryName = getQueryName({ editionId, questionId })

    if (defaultQueries.includes(query)) {
        if (['allEditionsData'].includes(query)) {
            queryOptions.allEditions = true
        }
        queryContents = getDefaultQuery({ queryOptions, queryArgs })
    } else {
        queryContents = query
    }
    if (!isEmpty(queryArgs)) {
        const queryArgsString = getQueryArgsString(queryArgs)
        if (queryArgsString) {
            queryContents = queryContents.replace(argumentsPlaceholder, queryArgsString)
        }
    } else {
        if (!addArgumentsPlaceholder) {
            queryContents = queryContents.replace(argumentsPlaceholder, '')
        }
    }
    const wrappedQuery = wrapQuery({
        queryName,
        queryContents,
        addRootNode: queryOptions.addRootNode
    })
    return wrappedQuery
}
