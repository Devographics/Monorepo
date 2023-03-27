import camelCase from 'lodash/camelCase.js'
import { indentString } from './indent_string.mjs'
import { getQuestionId } from './helpers.mjs'
import isEmpty from 'lodash/isEmpty.js'

const argumentsPlaceholder = '<ARGUMENTS_PLACEHOLDER>'

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

const getFacetFragment = addEntities => `
    facetBuckets {
        id
        count
        percentageQuestion
        percentageSurvey
        percentageFacet
        ${addEntities ? getEntityFragment() : ''}
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
                                entity {
                                    id
                                    name
                                    nameClean
                                    nameHtml
                                }
                                options {
                                    ${getEntityFragment()}
                                    id
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

export const getQueryArgs = ({ facet, filters, parameters }) => {
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
    return wrapArguments(args)
}

export const getDefaultQuery = queryOptions => {
    const {
        surveyId,
        editionId,
        sectionId,
        questionId,
        fieldId,
        facet,
        filters,
        parameters = {},
        addEntities = false,
        allEditions = false
    } = queryOptions
    const queryArgs = getQueryArgs({ facet, filters, parameters })

    const editionType = allEditions ? 'allEditions' : 'currentEdition'

    const questionIdString = fieldId ? `${questionId}: ${fieldId}` : questionId

    return `
  surveys {
    ${surveyId} {
      ${editionId} {
        ${sectionId} {
          ${questionIdString} {
            responses${queryArgs} {
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
                  ${addEntities ? getEntityFragment() : ''}
                  ${facet ? getFacetFragment(addEntities) : ''}
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

/*

Get query by either

A) generating a default query based on presets

or 

B) using query defined in block template definition

*/
const defaultQueries = [
    'currentEditionData',
    'currentEditionDataWithEntities',
    'allEditionsData',
    'allEditionsDataWithEntities'
]
export const getQuery = ({
    query,
    queryOptions,
    isLog = false,
    enableCache,
    addRootNode = true
}) => {
    const { editionId, questionId } = queryOptions
    const queryName = getQueryName({ editionId, questionId })

    let queryContents

    if (isLog) {
        // when logging we can leave out enableCache parameter
        delete queryOptions.parameters.enableCache
    }

    if (defaultQueries.includes(query)) {
        if (['allEditionsData'].includes(query)) {
            queryOptions.allEditions = true
        }
        if (['currentEditionDataWithEntities', 'allEditionsDataWithEntities'].includes(query)) {
            queryOptions.addEntities = true
        }
        queryContents = getDefaultQuery(queryOptions)
    } else {
        queryContents = query
        const queryArgs = getQueryArgs(queryOptions)
        queryContents = queryContents.replace(argumentsPlaceholder, queryArgs)
        // if (isLog) {
        //     queryContents = queryContents.replace(enableCachePlaceholder, '')
        // } else {
        //     queryContents = queryContents.replace(
        //         enableCachePlaceholder,
        //         `enableCache: ${enableCache.toString()}`
        //     )
        // }
    }

    const wrappedQuery = wrapQuery({ queryName, queryContents, addRootNode })
    return wrappedQuery
}
