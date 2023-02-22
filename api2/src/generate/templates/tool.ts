import { TemplateFunction } from '../types'
import { TOOLS_OPTIONS } from '../../constants'
import {
    idResolverFunction,
    commentsResolverFunction,
    responsesResolverFunction,
    entityResolverFunction
} from '../resolvers'
import { getFiltersTypeName, getFacetsTypeName } from '../graphql_templates'
import { graphqlize } from '../helpers'

export const tool: TemplateFunction = ({ survey, question }) => {
    const fieldTypeName = `${graphqlize(survey.id)}Tool`
    return {
        dbPath: `tools.${question.id}.experience`,
        dbPathComments: `tools.${question.id}.comments`,
        options: TOOLS_OPTIONS.map(id => ({
            id
        })),
        fieldTypeName,
        filterTypeName: 'ToolFilters',
        autogenerateFilterType: false,
        autogenerateOptionType: false,
        autogenerateEnumType: false,
        typeDef: `type ${fieldTypeName} {
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
    }
}
