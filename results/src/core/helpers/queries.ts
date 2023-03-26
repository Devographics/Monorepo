import { BlockDefinition } from 'core/types'
import camelCase from 'lodash/camelCase.js'
import { indentString } from './indentString'
import { ResponsesParameters, Filters } from '@devographics/types'
import { PageContextValue } from 'core/types/context'
import isEmpty from 'lodash/isEmpty'

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

interface QueryOptions {
    surveyId: string
    editionId: string
    sectionId: string
    questionId: string
    fieldId?: string
    facet?: string
    filters?: Filters
    parameters?: ResponsesParameters
    allEditions?: boolean
    addEntities?: boolean
}

interface ResponseArgumentsStrings {
    facet?: string
    filters?: string
    parameters?: string
}

export const getDefaultQuery = ({
    surveyId,
    editionId,
    sectionId,
    questionId,
    fieldId,
    facet,
    filters,
    parameters,
    addEntities = false,
    allEditions = false
}: QueryOptions) => {
    const args = {} as ResponseArgumentsStrings
    if (facet) {
        args.facet = facet
    }
    if (filters && !isEmpty(filters)) {
        args.filters = unquote(JSON.stringify(filters))
    }
    if (parameters && !isEmpty(parameters)) {
        args.parameters = unquote(JSON.stringify(parameters))
    }
    const editionType = allEditions ? 'allEditions' : 'currentEdition'

    const questionIdString = fieldId ? `${questionId}: ${fieldId}` : questionId

    return `
surveys {
  ${surveyId} {
    ${editionId} {
      ${sectionId} {
        ${questionIdString} {
          responses${wrapArguments(args)} {
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

export const cleanQueryLinebreaks = s => s.replaceAll('\n\n\n', '\n').replaceAll('\n\n', '\n')

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

const enableCachePlaceholder = 'ENABLE_CACHE_PLACEHOLDER'

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

export const getBlockQuery = ({
    block,
    pageContext,
    isLog = false,
    enableCache = false
}: {
    block: BlockDefinition
    pageContext: PageContextValue
    isLog?: boolean
    enableCache?: boolean
}) => {
    const { query, id: questionId } = block
    const { id: sectionId, currentSurvey, currentEdition } = pageContext
    const { id: surveyId } = currentSurvey
    const { id: editionId } = currentEdition

    if (!query) {
        return
    } else {
        let queryContents
        const queryName = getQueryName({ editionId, questionId })
        const queryOptions: QueryOptions = { surveyId, editionId, sectionId, questionId }

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
            if (isLog) {
                queryContents = queryContents.replace(enableCachePlaceholder, '')
            } else {
                queryContents = queryContents.replace(
                    enableCachePlaceholder,
                    `enableCache: ${enableCache.toString()}`
                )
            }
        }
        const wrappedQuery = wrapQuery({ queryName, queryContents, addRootNode: false })
        return wrappedQuery
    }
}
