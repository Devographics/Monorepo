import camelCase from 'lodash/camelCase.js'
import { indentString } from './indent_string.mjs'

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

const entityFragment = `entity {
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
                                    ${entityFragment}
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

const unquote = s => s.replace(/"([^"]+)":/g, '$1:')

export const getDefaultQuery = ({
    surveyId,
    editionId,
    sectionId,
    questionId,
    parameters = {},
    addEntities = false,
    allEditions = false
}) => {
    const enableCache = process.env.USE_CACHE === 'false' ? false : true

    const params = { ...parameters, enableCache }
    const parametersString = `(parameters: ${unquote(JSON.stringify(params))})`

    const editionType = allEditions ? 'allEditions' : 'currentEdition'

    return `
dataAPI {
  surveys {
    ${surveyId} {
      ${editionId} {
        ${sectionId} {
          ${questionId} {
            responses${parametersString} {
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
                  ${addEntities ? entityFragment : ''}
                }
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
export const wrapQuery = ({ queryName, queryContents }) => `query ${queryName} {
   ${indentString(queryContents, 4)}
}`

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
