import { ApiTemplateFunction, QuestionApiTemplateOutput } from '../../types/surveys'
import {
    feature as featureTemplateFunction,
    featurev2 as featureTemplateFunctionv2,
    featurev3 as featureTemplateFunctionv3,
    featureWithFollowups as featureWithFollowupsTemplateFunction
} from '@devographics/templates'
// import {
//     idResolverFunction,
//     responsesResolverFunction,
//     commentsResolverFunction,
//     entityResolverFunction
// } from '../resolvers'
import { getFiltersTypeName, getFacetsTypeName } from '../helpers'
import { graphqlize } from '../helpers'
import { getResponseTypeName } from '../../graphql/templates/responses'
import { Survey } from '@devographics/types'

export const getFeatureFieldTypeName = ({ survey }: { survey: Survey }) =>
    `${graphqlize(survey.id)}Feature`

// not used anymore?
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
    options: [FeatureOption]
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

export const feature: ApiTemplateFunction = options => {
    const { survey, question } = options
    const fieldTypeName = `${graphqlize(survey.id)}Feature`
    const output: QuestionApiTemplateOutput = {
        ...featureTemplateFunction(options),
        fieldTypeName,
        filterTypeName: 'FeatureFilters',
        autogenerateFilterType: false,
        autogenerateOptionType: false,
        autogenerateEnumType: false,
        typeDef: getTypeDef({ fieldTypeName, survey, addFollowups: false })
    }
    return output
}

export const featurev2: ApiTemplateFunction = options => {
    const { survey, question } = options
    const fieldTypeName = `${graphqlize(survey.id)}Feature`
    const output: QuestionApiTemplateOutput = {
        ...featureTemplateFunctionv2(options),
        fieldTypeName,
        filterTypeName: 'FeatureFilters',
        autogenerateFilterType: false,
        autogenerateOptionType: false,
        autogenerateEnumType: false,
        typeDef: getTypeDef({ fieldTypeName, survey, addFollowups: false })
    }
    return output
}

export const featurev3: ApiTemplateFunction = options => {
    const { survey, question } = options
    const fieldTypeName = `${graphqlize(survey.id)}Feature`
    const output: QuestionApiTemplateOutput = {
        ...featureTemplateFunctionv3(options),
        fieldTypeName,
        filterTypeName: 'FeatureFilters',
        autogenerateFilterType: false,
        autogenerateOptionType: false,
        autogenerateEnumType: false,
        generatedBy: 'feature',
        typeDef: getTypeDef({ fieldTypeName, survey, addFollowups: false })
    }
    return output
}

export const featureWithFollowups: ApiTemplateFunction = options => {
    const { survey, question } = options
    const fieldTypeName = `${graphqlize(survey.id)}Feature`
    const output: QuestionApiTemplateOutput = {
        ...featureWithFollowupsTemplateFunction(options),
        fieldTypeName,
        filterTypeName: 'FeatureFilters',
        autogenerateFilterType: false,
        autogenerateOptionType: false,
        autogenerateEnumType: false,
        typeDef: getTypeDef({ fieldTypeName, survey, addFollowups: true })
    }
    return output
}

export const featureWithFollowups2 = featureWithFollowups
