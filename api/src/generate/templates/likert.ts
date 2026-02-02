// not currently used
// instead, each likert subfield is treated as its own independent question

import { ApiTemplateFunction, ResolverMap, ResolverType } from '../../types/surveys'
import { graphqlize } from '../helpers'
import { getResponsesTypeDef } from '../subfields'
import { QuestionApiObject } from '../../types/surveys'
import { subFields } from '../../generate/subfields'
import { ResultsSubFieldEnum } from '@devographics/types'
import { allEditionsResolver } from '../resolvers/editions'

export const getResolverMap = async (question: QuestionApiObject): Promise<ResolverMap> => {
    const resolvers: ResolverMap = {}
    for (const option of question.options!) {
        const subField = String(option.id)
        resolvers[subField] = async (parent, args, context, info) => {
            console.log('getResolverMap')
            console.log(subField)
            console.log(parent)
            console.log(args)
            return await allEditionsResolver(parent, args, context, info)
        }
    }
    return resolvers
}

export const likert: ApiTemplateFunction = ({ question: question_, survey, edition, section }) => {
    const fieldTypeName = `${graphqlize(survey.id)}${graphqlize(question_.id!)}Likert`

    const question = {
        surveyId: survey.id,
        ...question_
        // optionTypeName: fieldTypeName + 'Option'
    } as QuestionApiObject

    const subFieldIds = [
        ResultsSubFieldEnum.ID,
        ResultsSubFieldEnum.METADATA
        // ResultsSubFieldEnum.OPTIONS
    ]
    const includedSubFields = subFields.filter(s => subFieldIds.includes(s.id))

    const typeDef = {
        ...question,
        generatedBy: 'likert',
        id: `${question.id}_likert`,
        fieldTypeName,
        typeDef: `type ${fieldTypeName} {
${includedSubFields.map(({ def }) => def(question)).join('\n  ')}
${question.options
    ?.map(option => getResponsesTypeDef(question.surveyId, String(option.id)))
    .join('\n')}
        }`,
        resolverMap: getResolverMap(question)
    }
    return typeDef
}
