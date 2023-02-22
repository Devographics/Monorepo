import { TemplateFunction } from '../types'
import { TOOLS_OPTIONS } from '../../constants'
import {
    idResolverFunction,
    commentsResolverFunction,
    responsesResolverFunction,
    entityResolverFunction
} from '../resolvers'
import { getFiltersTypeName, getFacetsTypeName } from '../graphql_templates'

export const tool: TemplateFunction = ({ survey, question }) => ({
    dbPath: `tools.${question.id}.experience`,
    dbPathComments: `tools.${question.id}.comments`,
    options: TOOLS_OPTIONS.map(id => ({
        id
    })),
    fieldTypeName: 'Tool',
    typeDef: `type Tool {
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
