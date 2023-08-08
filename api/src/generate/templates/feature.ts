import { ApiTemplateFunction, QuestionApiTemplateOutput } from '../../types/surveys'
import {
    feature as featureTemplateFunction,
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

<<<<<<< Updated upstream
=======
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
}
`

>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
        typeDef: `type ${fieldTypeName} {
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
=======
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
>>>>>>> Stashed changes
