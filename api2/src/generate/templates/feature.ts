import { TemplateFunction } from '../../types/surveys'
import { FEATURES_OPTIONS } from '@devographics/constants'
import {
    idResolverFunction,
    responsesResolverFunction,
    commentsResolverFunction,
    entityResolverFunction
} from '../resolvers'
import { getFiltersTypeName, getFacetsTypeName } from '../helpers'
import { graphqlize } from '../helpers'
import { getResponseTypeName } from '../../graphql/templates/responses'

export const feature: TemplateFunction = ({ survey, question }) => {
    const fieldTypeName = `${graphqlize(survey.id)}Feature`
    return {
        ...question,
        id: question.id || 'placeholder',
        dbPath: `features.${question.id}.experience`,
        dbPathComments: `features.${question.id}.comment`,
        options: FEATURES_OPTIONS.map(id => ({
            id
        })),
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
}
