import {
    TemplateFunction,
    ResolverMap,
    Survey,
    Section,
    QuestionObject,
    Edition,
    ComputeOptions
} from '../types'
import { graphqlize } from '../helpers'
import { genericComputeFunction } from '../../compute'
import { useCache, computeKey } from '../../caching'
import { RequestContext } from '../../types'

export const section_tools_responses: TemplateFunction = ({ survey, section }) => {
    const fieldTypeName = `${graphqlize(section.id)}Tools`
    // in any given section, the tools will be the questions which don't have a template defined
    const sectionTools = section.questions.filter(q => typeof q.template === 'undefined')

    return {
        id: `${section.id}_responses`,
        fieldTypeName,
        typeDef: `type ${fieldTypeName} {
            ids: [String]
            years: [Int]
            data(filters: ${graphqlize(survey.id)}Filters): [Tool]
        }`,
        resolverMap: {
            data: async (root, args, context, info) => {
                const { survey, edition, section, computeOptions } = args
                console.log(args)
                const key = computeKey(getSectionToolsResponses, {
                    surveyId: survey.id,
                    editionId: edition.id,
                    sectionId: section.id,
                    ...computeOptions
                })
                console.log(key)
                const questions = sectionTools.map(q => q.id)

                return await useCache({
                    key,
                    func: getSectionToolsResponses,
                    context,
                    funcOptions: {
                        ...args,
                        questions
                    }
                })
            },
            ids: () => {
                return sectionTools.map(q => q.id)
            },
            years: () => {
                return survey.editions.map(e => e.year)
            }
        }
    }
}

async function getSectionToolsResponses({
    survey,
    edition,
    section,
    questions,
    context,
    computeOptions
}: {
    survey: Survey
    edition: Edition
    section: Section
    questions: QuestionObject[]
    context: RequestContext
    computeOptions: ComputeOptions
}) {
    const results = []
    for (const question of questions) {
        const toolResponses = await genericComputeFunction({
            survey,
            edition,
            section,
            question,
            context,
            options: computeOptions
        })
        results.push(toolResponses)
    }
    return results
}
