import { ApiTemplateFunction } from '../../types/surveys'

// import { FEATURES_OPTIONS } from '@devographics/constants'
const FEATURES_OPTIONS = ['never_heard', 'heard', 'used']
import {
    idResolverFunction,
    responsesResolverFunction,
    commentsResolverFunction,
    entityResolverFunction
} from '../resolvers'
import { getFiltersTypeName, getFacetsTypeName, getPaths } from '../helpers'
import { graphqlize } from '../helpers'
import { getResponseTypeName } from '../../graphql/templates/responses'
import { DbSuffixes } from '@devographics/types'

export const feature: ApiTemplateFunction = options => {
    const { survey, question } = options
    const fieldTypeName = `${graphqlize(survey.id)}Feature`
    const output = {
        ...question,
        id: question.id || 'placeholder',
        allowComment: true,
        // dbSuffix: 'experience',
        // dbPath: `features.${question.id}.experience`,
        // dbPathComments: `features.${question.id}.comment`,
        options: FEATURES_OPTIONS.map(id => ({
            id
        })),
        defaultSort: 'options',
        fieldTypeName,
        filterTypeName: 'FeatureFilters',
        autogenerateFilterType: false,
        autogenerateOptionType: false,
        autogenerateEnumType: false,
        typeDef: `type ${fieldTypeName} {
    id: String
    comments: ItemComments
    entity: Entity
    responses(filters: ${getFiltersTypeName(
        survey.id
    )},  parameters: Parameters, facet: ${getFacetsTypeName(survey.id)}): ${getResponseTypeName(
            survey.id
        )}
}`,
        resolverMap: {
            id: idResolverFunction,
            comments: commentsResolverFunction,
            responses: responsesResolverFunction,
            entity: entityResolverFunction
        }
    }
    return {
        ...output,
        ...getPaths({ ...options, question: output }, DbSuffixes.EXPERIENCE)
    }
}
