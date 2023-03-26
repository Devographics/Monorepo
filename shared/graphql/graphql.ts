export const foo = 123
import camelCase from 'lodash/camelCase.js'
import { ResponsesParameters, Filters } from '@devographics/types'
import isEmpty from 'lodash/isEmpty'

export function indentString(string, count = 1, options = {}) {
    const { indent = ' ', includeEmptyLines = false } = options

    if (typeof string !== 'string') {
        throw new TypeError(`Expected \`input\` to be a \`string\`, got \`${typeof string}\``)
    }

    if (typeof count !== 'number') {
        throw new TypeError(`Expected \`count\` to be a \`number\`, got \`${typeof count}\``)
    }

    if (count < 0) {
        throw new RangeError(`Expected \`count\` to be at least 0, got \`${count}\``)
    }

    if (typeof indent !== 'string') {
        throw new TypeError(
            `Expected \`options.indent\` to be a \`string\`, got \`${typeof indent}\``
        )
    }

    if (count === 0) {
        return string
    }

    const regex = includeEmptyLines ? /^/gm : /^(?!\s*$)/gm

    return string.replace(regex, indent.repeat(count))
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
