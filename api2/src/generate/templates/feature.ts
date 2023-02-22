import { TemplateFunction } from '../types'
import { FEATURES_OPTIONS } from '../../constants'
import { graphqlize } from '../helpers'
import {
    responsesResolverFunction,
    commentsResolverFunction,
    entityResolverFunction
} from '../resolvers'

export const feature: TemplateFunction = ({ survey, question }) => ({
    dbPath: `features.${question.id}.experience`,
    dbPathComments: `features.${question.id}.comment`,
    options: FEATURES_OPTIONS.map(id => ({
        id
    })),
    fieldTypeName: 'Feature',
    typeDef: `type Feature {
    comments: ItemComments
    entity: Entity
    responses(filters: ${graphqlize(survey.id)}Filters): Responses
}`,
    resolverMap: {
        comments: commentsResolverFunction,
        responses: responsesResolverFunction,
        entity: entityResolverFunction
    }
})
