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

// not used anymore?
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
        generatedBy: 'tool',
        typeDef: `type ${fieldTypeName} {
    id: String
    _metadata: QuestionMetadata
    _correlations: Correlations
    options: [ToolOption]
    comments: ItemComments
    entity: Entity
    responses(filters: ${getFiltersTypeName(
        survey.id
    )},  parameters: Parameters, facet: ${getFacetsTypeName(survey.id)}): ${getResponseTypeName(
            survey.id
        )}
    combined(filters: ${getFiltersTypeName(
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

// this one is used!!
// NOTE: this typedef is hardcoded rather than generated from `subFields`, so it
// must be kept in sync by hand: every subfield whose `addIf` can pass for a
// tool-template question needs a matching line here. A resolver present (via
// getQuestionResolverMap, which does iterate subFields) without a matching
// schema field crashes the server at startup with "defined in resolvers, but
// not in schema". `_cardinalities` is intentionally omitted because its `addIf`
// requires `allowMultiple`, which no tool-template question sets.
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
    _correlations: Correlations
    options: [ToolOption]
    comments(parameters: CommentParameters): ItemComments
    entity: Entity
    responses(filters: ${getFiltersTypeName(
        survey.id
    )},  parameters: Parameters, facet: ${getFacetsTypeName(survey.id)}): ${getResponseTypeName(
    survey.id
)}
    combined(filters: ${getFiltersTypeName(
        survey.id
    )},  parameters: Parameters, facet: ${getFacetsTypeName(survey.id)}): ${getResponseTypeName(
    survey.id
)}
}
`

// this one is used!
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
        generatedBy: 'toolv3',
        typeDef: getTypeDef({ fieldTypeName, survey, addFollowups: false })
    }
    return output
}
