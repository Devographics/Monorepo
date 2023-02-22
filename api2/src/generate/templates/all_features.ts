import { QuestionObject, TemplateFunction } from '../types'
import { graphqlize } from '../helpers'
import { getFiltersTypeName, getFacetsTypeName } from '../graphql_templates'
import { getQuestionObject } from '../generate'

export const all_features: TemplateFunction = ({ survey, edition, section }) => {
    const fieldTypeName = `${graphqlize(survey.id)}${graphqlize(section.id)}AllItems`
    let editionTools: QuestionObject[] = []
    for (const section of edition.sections.filter(s => s.template === 'tool')) {
        // in any given section, the tools will be the questions which don't have a template defined
        editionTools = [
            ...editionTools,
            ...section.questions
                .filter(q => typeof q.template === 'undefined')
                .map(question => getQuestionObject({ survey, edition, section, question }))
        ]
    }
    return {
        id: `all_items`,
        fieldTypeName,
        typeDef: `type ${fieldTypeName} {
    ids: [String]
    years: [Int]
    data(filters: ${getFiltersTypeName(survey.id)},  options: Options, facet: ${getFacetsTypeName(
            survey.id
        )}): [Tool]
}`,
        resolverMap: {
            data: async (parent, args, context, info) => {
                return editionTools.map(question => ({ ...parent, question }))
            },
            ids: () => {
                return editionTools.map(q => q.id)
            },
            years: () => {
                return survey.editions.map(e => e.year)
            }
        }
    }
}
