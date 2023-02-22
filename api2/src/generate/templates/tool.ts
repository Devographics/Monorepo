import { TemplateFunction } from '../types'
import { TOOLS_OPTIONS } from '../../constants'
import { graphqlize } from '../helpers'
import {
    commentsResolverFunction,
    experienceResolverFunction,
    entityResolverFunction
} from '../resolvers'

export const tool: TemplateFunction = ({ survey, question }) => ({
    dbPath: `tools.${question.id}.experience`,
    dbPathComments: `tools.${question.id}.comments`,
    options: TOOLS_OPTIONS.map(id => ({
        id
    })),
    fieldTypeName: 'Tool',
    typeDef: `type Tool {
        comments: ItemComments
        entity: Entity
        experience(filters: ${graphqlize(survey.id)}Filters): Experience
    }`,
    resolverMap: {
        comments: commentsResolverFunction,
        experience: experienceResolverFunction,
        entity: entityResolverFunction
    }
})
