import { TemplateFunction } from '../../types/surveys'
import { TOOLS_OPTIONS } from '../../constants'
import {
    idResolverFunction,
    commentsResolverFunction,
    responsesResolverFunction,
    entityResolverFunction
} from '../resolvers'
import { getFiltersTypeName, getFacetsTypeName } from '../helpers'
import { graphqlize } from '../helpers'
import { getResponseTypeName } from '../../graphql/templates/responses'

export const tool: TemplateFunction = ({ survey, question }) => {
    const fieldTypeName = `${graphqlize(survey.id)}Tool`
    return {
        ...question,
        id: question.id || 'placeholder',
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
