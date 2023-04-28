import camelCase from 'lodash/camelCase.js'
import { indentString } from './indent_string.mjs'
import { getQuestionId } from './helpers.mjs'
import isEmpty from 'lodash/isEmpty.js'

const argumentsPlaceholder = '<ARGUMENTS_PLACEHOLDER>'

export const bucketFacetsPlaceholder = '<BUCKETFACETS_PLACEHOLDER>'

export const getLocalesQuery = (localeIds, contexts, loadStrings = true) => {
    const args = []
    if (localeIds.length > 0) {
        args.push(`localeIds: [${localeIds.map(id => `"${id}"`).join(',')}]`)
    }
    if (contexts.length > 0) {
        args.push(`contexts: [${contexts.join(', ')}]`)
    }

    const argumentsString = args.length > 0 ? `(${args.join(', ')})` : ''

    return `
query {
    internalAPI {
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
        percentageFacet
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

export const getQueryArgsString = ({ facet, filters, parameters, xAxis, yAxis }) => {
    const args = {}
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

export const getDefaultQuery = ({ queryOptions, queryArgs = {} }) => {
    const {
        surveyId,
        editionId,
        sectionId,
        questionId,
        fieldId,
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
          responses${queryArgsString} {
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

export const getQueryName = ({ editionId, questionId }) =>
    `${camelCase(editionId)}${camelCase(questionId)}Query`

/*

Wrap query contents with query FooQuery {...}

*/
export const wrapQuery = ({ queryName, queryContents, addRootNode }) => {
    const isInteralAPIQuery = queryContents.includes('internalAPI')
    if (addRootNode && !isInteralAPIQuery) {
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
export const getQuery = ({ query, queryOptions, queryArgs }) => {
    let queryContents

    if (queryOptions.isLog) {
        // when logging we can leave out enableCache parameter
        delete queryOptions.parameters.enableCache
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
