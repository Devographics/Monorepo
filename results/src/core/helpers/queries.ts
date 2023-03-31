import { BlockDefinition } from 'core/types'
import camelCase from 'lodash/camelCase.js'
import { indentString } from './indentString'
import { ResponsesParameters, Filters } from '@devographics/types'
import { PageContextValue } from 'core/types/context'
import isEmpty from 'lodash/isEmpty'
import { usePageContext } from 'core/helpers/pageContext'
import { FacetItem } from 'core/filters/types'

export const argumentsPlaceholder = '<ARGUMENTS_PLACEHOLDER>'

export const bucketFacetsPlaceholder = '<BUCKETFACETS_PLACEHOLDER>'

export const getEntityFragment = () => `entity {
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

export const getFacetFragment = (addEntities?: boolean) => `
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
}

export const getQueryArgs = ({
    facet,
    filters,
    parameters
}: {
    facet?: string
    filters?: Filters
    parameters?: ResponsesParameters
}) => {
    const args: ResponseArgumentsStrings = {}
    if (facet) {
        args.facet = facet
    }
    if (filters && !isEmpty(filters)) {
        args.filters = unquote(JSON.stringify(filters))
    }
    if (parameters && !isEmpty(parameters)) {
        args.parameters = unquote(JSON.stringify(parameters))
    }
    if (isEmpty(args)) {
        return
    } else {
        return wrapArguments(args)
    }
}

interface QueryOptions {
    surveyId: string
    editionId: string
    sectionId: string
    questionId: string
    fieldId?: string
    facet?: FacetItem
    filters?: Filters
    parameters?: ResponsesParameters
    allEditions?: boolean
    addEntities?: boolean
    addArgumentsPlaceholder?: boolean
    addBucketFacetsPlaceholder?: boolean
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
    allEditions = false,
    addArgumentsPlaceholder = false,
    addBucketFacetsPlaceholder = false
}: QueryOptions) => {
    const queryArgs = addArgumentsPlaceholder
        ? argumentsPlaceholder
        : getQueryArgs({ facet, filters, parameters })
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
    addRootNode
}: {
    queryName: string
    queryContents: string
    addRootNode: boolean
}) => {
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
    enableCache = false,
    addArgumentsPlaceholder = false,
    addBucketFacetsPlaceholder = false
}: {
    block: BlockDefinition
    pageContext: PageContextValue
    isLog?: boolean
    enableCache?: boolean
    addArgumentsPlaceholder?: boolean
    addBucketFacetsPlaceholder?: boolean
}) => {
    const { query, id: questionId } = block
    const { id: sectionId, currentSurvey, currentEdition } = pageContext
    const { id: surveyId } = currentSurvey
    const { id: editionId } = currentEdition

    if (!query) {
        return ''
    } else {
        let queryContents
        const queryName = getQueryName({ editionId, questionId })
        const queryOptions: QueryOptions = {
            surveyId,
            editionId,
            sectionId,
            questionId,
            addArgumentsPlaceholder,
            addBucketFacetsPlaceholder
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
            if (queryArgs) {
                queryContents = queryContents.replace(argumentsPlaceholder, queryArgs)
            }
        }
        const wrappedQuery = wrapQuery({ queryName, queryContents, addRootNode: false })
        return wrappedQuery
    }
}

export const useBlockQuery = (block: BlockDefinition) => {
    const pageContext = usePageContext()
    const query = getBlockQuery({ block, pageContext })
    return query
}
