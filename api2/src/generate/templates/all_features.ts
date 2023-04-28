import { Question, QuestionApiObject } from '../../types/surveys'
import { getSectionItems, graphqlize } from '../helpers'
import { getToolsFeaturesResolverMap } from '../resolvers'
import { ApiTemplateFunction } from '../../types/surveys'

export const all_features: ApiTemplateFunction = ({ survey, edition, section, question }) => {
    const fieldTypeName = `${graphqlize(survey.id)}AllFeatures`
    let items: Question[] = []
    for (const section of edition.sections.filter(s => s.template === 'feature')) {
        items = [...items, ...getSectionItems({ survey, edition, section })]
    }

    return {
        ...question,
        id: `allFeatures`,
        fieldTypeName,
        typeDef: `type ${fieldTypeName} {
    ids: [String]
    years: [Int]
    items: [${graphqlize(survey.id)}Feature]
}`,
        resolverMap: getToolsFeaturesResolverMap({ survey, edition, items })
    }
}
