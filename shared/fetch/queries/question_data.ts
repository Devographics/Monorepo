import { getEntityFragment } from './entity_fragment'
import {
    QuestionMetadata,
    Filters,
    ResponsesParameters,
    ResultsSubFieldEnum
} from '@devographics/types'
import isEmpty from 'lodash/isEmpty.js'

export type FacetItem = Pick<QuestionMetadata, 'id' | 'sectionId' | 'optionsAreSequential'>

export interface QueryArgs {
    facet?: FacetItem
    filters?: Filters
    parameters?: ResponsesParameters
    xAxis?: string
    yAxis?: string
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
    fieldId?: string
}

interface QueryOptions extends ProvidedQueryOptions {
    surveyId: string
    editionId: string
    sectionId: string
    questionId: string
    subField?: ResultsSubFieldEnum
}

interface ResponseArgumentsStrings {
    facet?: string
    filters?: string
    parameters?: string
    axis1?: string
    axis2?: string
}

const facetItemToFacet = ({ sectionId, id }: FacetItem) => `${sectionId}__${id}`

const getCommentsCountFragment = () => `
  comments {
    currentEdition {
      count
    }
  }
`

const allEditionsFragment = `editionId
  year`

const unquote = (s: string) => s.replace(/\"/g, '')

const wrapArguments = (args: ResponseArgumentsStrings) => {
    const keys = Object.keys(args)

    return keys.length > 0
        ? `(${keys
              .filter(k => !!args[k as keyof ResponseArgumentsStrings])
              .map(k => `${k}: ${args[k as keyof ResponseArgumentsStrings]}`)
              .join(', ')})`
        : ''
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

export const getQuestionDataQuery = ({
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
        addQuestionComments = false
    } = queryOptions
    const queryArgsString = getQueryArgsString(queryArgs)
    const editionType = allEditions ? 'allEditions' : 'currentEdition'

    const questionIdString = fieldId ? `${questionId}: ${fieldId}` : questionId

    return `
query QuestionData {
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
