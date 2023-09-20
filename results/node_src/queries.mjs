import camelCase from 'lodash/camelCase.js'
import { indentString } from './indent_string.mjs'
import isEmpty from 'lodash/isEmpty.js'

const MODE_COMBINED = 'combined'
const MODE_GRID = 'grid'
const MODE_FACET = 'facet'

// export const START_MARKER = '# fragmentStart'
// export const END_MARKER = '# fragmentEnd'

export const OPERATORS = ['eq', 'in', 'nin']

const BucketUnits = {
    AVERAGE: 'averageByFacet'
}

export const argumentsPlaceholder = '<ARGUMENTS_PLACEHOLDER>'

export const bucketFacetsPlaceholder = '<BUCKETFACETS_PLACEHOLDER>'

const convertToGraphQLEnum = s => s.replace('-', '_')

export const getLocalesQuery = (contexts, loadStrings = true) => {
    const args = []
    // if (localeIds.length > 0) {
    //     args.push(`localeIds: [${localeIds.map(convertToGraphQLEnum).join(',')}]`)
    // }
    if (contexts.length > 0) {
        args.push(`contexts: [${contexts.join(', ')}]`)
    }

    const argumentsString = args.length > 0 ? `(${args.join(', ')})` : ''

    return `
query {
    dataAPI {
        locales${argumentsString} {
            completion
            id
            label
            ${
                loadStrings
                    ? `strings {
                key
                t
                tHtml
                tClean
                context
                isFallback
            }`
                    : ''
            }
            translators
        }
    }
}
`
}

export const getLocaleContextQuery = (localeId, context) => {
    return `
query {
    dataAPI {
        locale(localeId: ${convertToGraphQLEnum(localeId)}, contexts: [${context}]) {
            id
            label
            strings {
                key
                t
                tHtml
                tClean
                context
                isFallback
            }
        }
    }
}
`
}

export const getPercentilesFragment = () => `
    percentilesByFacet {
        p0
        p25
        p50
        p75
        p100
    }
`

const getEntityFragment = () => `entity {
    name
    nameHtml
    nameClean
    id
    example {
      label
      language
      code
      codeHighlighted
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

const getFacetFragment = addBucketsEntities => `
    facetBuckets {
        id
        count
        percentageQuestion
        percentageSurvey
        percentageBucket
        ${addBucketsEntities ? getEntityFragment() : ''}
    }
`

const getCommentsCountFragment = () => `
comments {
    currentEdition {
      count
    }
  }
`

export const getMetadataQuery = ({ surveyId, editionId }) => {
    return `
query {
    dataAPI {
        surveys {
            ${surveyId} {
                _metadata {
                    domain
                    id
                    name
                    emailOctopus {
                        listId
                    }
                    partners {
                        name
                        url
                        imageUrl
                    }
                    editions {
                        year
                        id
                        resultsUrl
                    }
                }
                ${editionId} {
                    _metadata {
                        id
                        year
                        status
                        startedAt
                        endedAt
                        questionsUrl
                        resultsUrl
                        imageUrl
                        faviconUrl
                        socialImageUrl
                        hashtag
                        enableChartSponsorships
                        tshirt {
                            images
                            url
                            price
                            designerUrl
                        }
                        sponsors {
                            id
                            name
                            url
                            imageUrl
                        }
                        credits {
                            id
                            role
                        }
                        sections {
                            id
                            questions {
                                id
                                template
                                optionsAreNumeric
                                optionsAreRange
                                optionsAreSequential
                                entity {
                                    id
                                    name
                                    nameClean
                                    nameHtml
                                }
                                options {
                                    ${getEntityFragment()}
                                    id
                                    average
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}`
}

const allEditionsFragment = `editionId
  year`

// v1: {"foo": "bar"} => {foo: "bar"}
// const unquote = s => s.replace(/"([^"]+)":/g, '$1:')

// v2: {"foo": "bar"} => {foo: bar} (for enums)
const unquote = s => s.replaceAll('"', '')

const wrapArguments = args => {
    const keys = Object.keys(args)

    return keys.length > 0
        ? `(${keys
              .filter(k => !!args[k])
              .map(k => `${k}: ${args[k]}`)
              .join(', ')})`
        : ''
}

const facetItemToFacet = ({ sectionId, id }) => `${sectionId}__${id}`

export const getQueryArgsString = ({ facet, filters, parameters, xAxis, yAxis }) => {
    const args = {}
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

export const getDefaultQuery = ({ queryOptions, queryArgs = {} }) => {
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
        addQuestionComments = false
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
                count
                id
                percentageQuestion
                percentageSurvey
                ${addBucketsEntities ? getEntityFragment() : ''}
                ${queryArgs.facet || addBucketFacetsPlaceholder ? BucketUnits.AVERAGE : ''}
                ${queryArgs.facet || addBucketFacetsPlaceholder ? getPercentilesFragment() : ''}
                ${queryArgs.facet ? getFacetFragment(addBucketsEntities) : ''}
                ${addBucketFacetsPlaceholder ? bucketFacetsPlaceholder : ''}
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

export const getQueryName = ({ editionId, questionId }) =>
    `${camelCase(editionId)}${camelCase(questionId)}Query`

/*

Wrap query contents with query FooQuery {...}

*/
export const wrapQuery = ({ queryName, queryContents, addRootNode }) => {
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

Remove "dataAPI" part

*/
const removeLast = (str, char) => {
    const lastIndex = str.lastIndexOf(char)
    return str.substring(0, lastIndex) + str.substring(lastIndex + 1)
}

export const cleanQuery = query => {
    const cleanQuery = removeLast(query.replace('dataAPI {', ''), '}')
    return cleanQuery
}

const defaultQueries = ['currentEditionData', 'allEditionsData']

/*

Take query, queryOptions, and queryArgs, and return full query

Note: query can be either a query name, or the full query text

*/
export const getQuery = ({ query: query_, queryOptions, queryArgs }) => {
    let queryContents,
        query = query_

    if (queryOptions.isLog) {
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
        if (queryOptions.isLog) {
            queryContents = queryContents.replace(argumentsPlaceholder, '')
        }
    }
    if (queryArgs) {
        const queryArgsString = getQueryArgsString(queryArgs)
        if (queryArgsString) {
            queryContents = queryContents.replace(argumentsPlaceholder, queryArgsString)
        }
    }
    let wrappedQuery = wrapQuery({
        queryName,
        queryContents,
        addRootNode: queryOptions.addRootNode
    })
    return wrappedQuery
}

/*

Note: the following is a duplicated non-Typescript version of the code in
core/filters/helpers

*/

/*

For a given block and pageContext, generate query and query options and return result

*/
export const getBlockQuery = ({
    block,
    pageContext,
    queryOptions: providedQueryOptions = {},
    queryArgs = {}
}) => {
    let stringQuery
    const { query, queryOptions: blockQueryOptions } = block

    const defaultQueryOptions = {
        surveyId: pageContext?.currentSurvey?.id,
        editionId: pageContext?.currentEdition?.id,
        sectionId: pageContext?.id,
        questionId: block.id
    }

    const queryOptions = { ...defaultQueryOptions, ...providedQueryOptions, ...blockQueryOptions }

    if (!query) {
        stringQuery = ''
    } else {
        stringQuery = getQuery({ query, queryOptions, queryArgs })
    }
    return stringQuery
}

function getNthPosition(s, subString, count, fromEnd = false) {
    const regex = new RegExp(subString, 'g')
    const totalCount = (s.match(regex) || []).length
    const nthIndex = fromEnd ? totalCount - count : count
    return s.split(subString, nthIndex).join(subString).length
}

const conditionsToFilters = conditions => {
    const filters = {}
    conditions.forEach(condition => {
        const { sectionId, fieldId, operator, value } = condition
        filters[`${sectionId}__${fieldId}`] = { [operator]: value }
    })
    return filters
}

/*

Generate query used for filtering

TODO: currently lots of search-and-replace for strings going on which
could be avoided by making template query definitions JS/TS objects that
define how to accept filters and series themselves.

*/
export const getFiltersQuery = ({ block, chartFilters, currentYear, queryOptions }) => {
    const { options = {}, filters, facet } = chartFilters
    const { enableYearSelect, mode } = options
    const query = getBlockQuery({
        block,
        queryOptions: {
            ...queryOptions,
            addArgumentsPlaceholder: true,
            addBucketFacetsPlaceholder: true
        }
    })
    // fragment starts after fourth "{"
    const fragmentStartIndex = getNthPosition(query, '{', 5) + 1
    // fragment ends before fourth "}" when counting from the end
    const fragmentEndIndex = getNthPosition(query, '}', 5, true) + 1
    const queryHeader = query.slice(0, fragmentStartIndex)
    const queryFragment = query.slice(fragmentStartIndex, fragmentEndIndex)
    let queryBody = queryFragment

    const seriesNames = []

    const queryFooter = query.slice(fragmentEndIndex)

    if (filters && (mode === MODE_GRID || mode === MODE_COMBINED)) {
        queryBody = filters
            .map((singleSeries, seriesIndex) => {
                let seriesFragment = queryFragment

                // {gender: {eq: male}, company_size: {eq: range_1}}
                // const filtersObject: FiltersObject = {}
                // singleSeries.conditions.forEach(condition => {
                //     const { fieldId, operator, value } = condition
                //     // transform e.g. es-ES into es_ES
                //     const cleanValue: FilterValue = Array.isArray(value)
                //         ? value.map(cleanUpValue)
                //         : cleanUpValue(value)
                //     filtersObject[fieldId] = { [operator]: cleanValue }
                // })

                const seriesName = `${block.id}_${seriesIndex + 1}`
                seriesNames.push(seriesName)

                const alreadyHasAlias = seriesFragment.includes(':')
                if (alreadyHasAlias) {
                    seriesFragment = seriesFragment.replace(block.id, `${seriesName}`)
                } else {
                    seriesFragment = seriesFragment.replace(block.id, `${seriesName}: ${block.id}`)
                }

                const queryArgs = getQueryArgsString({
                    filters: conditionsToFilters(singleSeries.conditions),
                    parameters: block.parameters
                })

                seriesFragment = seriesFragment.replace(argumentsPlaceholder, queryArgs || '')

                if (enableYearSelect && singleSeries.year) {
                    seriesFragment = seriesFragment.replace(
                        `year: ${currentYear}`,
                        `year: ${singleSeries.year}`
                    )
                }
                return seriesFragment
            })
            .join('')
    } else if (facet && mode === MODE_FACET) {
        const queryArgs = getQueryArgsString({
            facet,
            parameters: block.parameters
        })

        // DIFFERENCE WITH CLIENT (TS) VERSION
        // const seriesName = `${block.fieldId || block.id}_by_${facet.id}`
        /*

        Note: in the client version, we customize a basic chart so we
        need to build a new ID. Here, we can just use the ID defined in raw_sitemap

        */

        const seriesName = block.id
        seriesNames.push(seriesName)

        const alreadyHasAlias = queryBody.includes(':')
        if (alreadyHasAlias) {
            queryBody = queryBody.replace(block.id, `${seriesName}`)
        } else {
            queryBody = queryBody.replace(block.id, `${seriesName}: ${block.fieldId || block.id}`)
        }
        queryBody = queryBody.replace(argumentsPlaceholder, queryArgs || '')

        queryBody = queryBody.replace(bucketFacetsPlaceholder, getFacetFragment() || '')

        // if (block?.variables?.fixedIds) {
        //     /*

        //     Because facets are obtained in a "reversed" structure from the API, in some cases
        //     (e.g. countries) we need to fix the ids to ensure each facet contains the same items.

        //     TODO: return proper structure from API and delete this step

        //     */
        //     const fixedIdsFilter = `{ ids: { in: [${block?.variables?.fixedIds
        //         .map(id => `"${id}"`)
        //         .join()}] } }`
        //     queryBody = queryBody.replace('filters: {}', `filters: ${fixedIdsFilter}`)
        // }
    }
    queryBody = queryBody.replace(argumentsPlaceholder, '')
    queryBody = queryBody?.replaceAll(bucketFacetsPlaceholder, '')

    const newQuery = queryHeader + queryBody + queryFooter

    return { query: newQuery, seriesNames }
}
