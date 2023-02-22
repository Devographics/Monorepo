import { TemplateFunction } from '../types'
import { FEATURES_OPTIONS } from '../../constants'
import {
    idResolverFunction,
    responsesResolverFunction,
    commentsResolverFunction,
    entityResolverFunction
} from '../resolvers'
import { getFiltersTypeName, getFacetsTypeName } from '../graphql_templates'

export const feature: TemplateFunction = ({ survey, question }) => ({
    dbPath: `features.${question.id}.experience`,
    dbPathComments: `features.${question.id}.comment`,
    options: FEATURES_OPTIONS.map(id => ({
        id
    })),
    fieldTypeName: 'Feature',
    typeDef: `type Feature {
    id: String
    comments: ItemComments
    entity: Entity
    responses(filters: ${getFiltersTypeName(
        survey.id
    )},  options: Options, facet: ${getFacetsTypeName(survey.id)}): Responses
}`,
    resolverMap: {
        id: idResolverFunction,
        comments: commentsResolverFunction,
        responses: responsesResolverFunction,
        entity: entityResolverFunction
    }
})
