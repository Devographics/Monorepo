/**
 * Adapted from "results/node_src/queries.mjs"
 */
import camelCase from 'lodash/camelCase.js'
import isEmpty from 'lodash/isEmpty.js'
import { indentString } from '../graphql-utils'

const argumentsPlaceholder = '<ARGUMENTS_PLACEHOLDER>'

export const bucketFacetsPlaceholder = '<BUCKETFACETS_PLACEHOLDER>'

const convertToGraphQLEnum = s => s.replace('-', '_')

// TODO: might be used for i18n
const getLocalesQuery = (contexts, loadStrings = true) => {
    const args: Array<string> = []
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
            ${loadStrings
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

const getLocaleContextQuery = (localeId, context) => {
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

const getEntityFragment = () => `entity {
    name
    nameHtml
    nameClean
    id
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

const getMetadataQuery = ({ surveyId, editionId }) => {
    return `
query {
    dataAPI {
        surveys {
            ${surveyId} {
                _metadata {
                    domain
                    id
                    name
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

interface QueryArgs {
    facet?: any, filters?: any, parameters?: any,
}
const getQueryArgsString = ({ facet, filters, parameters, xAxis, yAxis }: QueryArgs & { xAxis?: any, yAxis?: any }) => {
    // TODO: type this
    const args: QueryArgs & { axis1?: any, axis2?: any } = {}
    if (facet) {
        args.facet = facet
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
        return
    } else {
        return wrapArguments(args)
    }
}

interface QueryOptions {
    surveyId: string, editionId: string, sectionId: string, questionId: string, fieldId?: string, subField?: string,
    // config
    addBucketsEntities?: boolean,
    allEditions?: boolean,
    addArgumentsPlaceholder?: boolean,
    addBucketFacetsPlaceholder?: boolean,
    addQuestionEntity?: boolean,
    addQuestionComments?: boolean,
    isLog?: boolean
    addRootNode?: boolean
}
const getDefaultQuery = ({ queryOptions, queryArgs = {} }: {
    queryOptions: QueryOptions,
    queryArgs: QueryArgs
}) => {
    const {
        surveyId,
        editionId,
        sectionId,
        questionId,
        fieldId,
        subField = 'responses',

        addBucketsEntities = false,
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

const getQueryName = ({ editionId, questionId }) =>
    `${camelCase(editionId)}${camelCase(questionId)}Query`

/*

Wrap query contents with query FooQuery {...}

*/
const wrapQuery = ({ queryName, queryContents, addRootNode }) => {
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

const defaultQueries = ['currentEditionData', 'allEditionsData']

/*

Take query, queryOptions, and queryArgs, and return full query

Note: query can be either a query name, or the full query text

*/
export const buildBlockQuery = ({ query: query_, queryOptions, queryArgs }: { query?: any, queryOptions: QueryOptions, queryArgs: QueryArgs }) => {
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
    }
    if (queryArgs) {
        const queryArgsString = getQueryArgsString(queryArgs)
        if (queryArgsString) {
            queryContents = queryContents.replace(argumentsPlaceholder, queryArgsString)
        }
    }
    const wrappedQuery = wrapQuery({
        queryName,
        queryContents,
        addRootNode: queryOptions.addRootNode
    })
    return wrappedQuery
}
