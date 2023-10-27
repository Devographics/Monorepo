import { tool as templateFunction } from '@devographics/templates'
import { ApiTemplateFunction, QuestionApiTemplateOutput } from '../../types/surveys'
import { toolv3 as toolTemplateFunctionv3 } from '@devographics/templates'

// import {
//     idResolverFunction,
//     commentsResolverFunction,
//     responsesResolverFunction,
//     entityResolverFunction
// } from '../resolvers'
import { getFiltersTypeName, getFacetsTypeName } from '../helpers'
import { graphqlize } from '../helpers'
import { getResponseTypeName } from '../../graphql/templates/responses'
import { Survey, SurveyMetadata } from '@devographics/types'

export const getToolFieldTypeName = ({ survey }: { survey: Survey }) =>
    `${graphqlize(survey.id)}Tool`

export const tool: ApiTemplateFunction = options => {
    const { survey, question } = options
    const fieldTypeName = getToolFieldTypeName({ survey })
    const output: QuestionApiTemplateOutput = {
        ...templateFunction(options),
        fieldTypeName,
        filterTypeName: 'ToolFilters',
        autogenerateFilterType: false,
        autogenerateOptionType: false,
        autogenerateEnumType: false,
        typeDef: `type ${fieldTypeName} {
    id: String
    _metadata: QuestionMetadata
    options: [ToolOption]
    comments: ItemComments
    entity: Entity
    responses(filters: ${getFiltersTypeName(
        survey.id
    )},  parameters: Parameters, facet: ${getFacetsTypeName(survey.id)}): ${getResponseTypeName(
            survey.id
        )}
}`
        // resolverMap: {
        //     id: idResolverFunction,
        //     comments: commentsResolverFunction,
        //     responses: responsesResolverFunction,
        //     entity: entityResolverFunction
        // }
    }

    return output
}

const getTypeDef = ({
    fieldTypeName,
    survey,
    addFollowups
}: {
    fieldTypeName: string
    survey: Survey
    addFollowups: boolean
}) => `type ${fieldTypeName} {
    id: String
    _metadata: QuestionMetadata
    options: [ToolOption]
    comments(parameters: CommentParameters): ItemComments
    entity: Entity
    responses(filters: ${getFiltersTypeName(
        survey.id
    )},  parameters: Parameters, facet: ${getFacetsTypeName(survey.id)}): ${getResponseTypeName(
    survey.id
)}
}
`

export const toolv3: ApiTemplateFunction = options => {
    const { survey, question } = options
    const fieldTypeName = `${graphqlize(survey.id)}Tool`
    const output: QuestionApiTemplateOutput = {
        ...toolTemplateFunctionv3(options),
        fieldTypeName,
        filterTypeName: 'ToolFilters',
        autogenerateFilterType: false,
        autogenerateOptionType: false,
        autogenerateEnumType: false,
        typeDef: getTypeDef({ fieldTypeName, survey, addFollowups: false })
    }
    return output
}
