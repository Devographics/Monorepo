import { Survey, QuestionApiObject, SurveyApiObject, TypeDefTemplateOutput } from '../../types'
import { getFacetsTypeName } from '../../generate/helpers'
import { SENTIMENT_FACET } from '@devographics/constants'

/*

Sample output:

enum StateOfJsFacets {
    language__proxies
    language__promise_all_settled
    language__dynamic_import
    language__nullish_coalescing
    language__optional_chaining
    language__private_fields
    # etc.
}

Note: when a question appears in different sections in different editions,
use the most recent section.

*/

export const generateFacetsType = ({
    survey,
    questionObjects
}: {
    survey: SurveyApiObject
    questionObjects: QuestionApiObject[]
}): TypeDefTemplateOutput => {
    const typeName = getFacetsTypeName(survey.id)
    // TODO: add support for likert scale questions
    const questionObjectsWithFilters = questionObjects
        .filter(q => typeof q.filterTypeName !== 'undefined' && q.surveyId === survey.id)
        .filter(q => q.template !== 'likert')

    return {
        generatedBy: 'facets',
        typeName,
        typeDef: `enum ${typeName} {
    ${SENTIMENT_FACET}
    ${questionObjectsWithFilters
        .sort((q1, q2) => q1?.sectionIds?.at(-1)?.localeCompare(q2?.sectionIds?.at(-1) ?? '') ?? 0)
        .sort((q1, q2) => (q1?.sectionIndex || 0) - (q2?.sectionIndex || 0))
        .map(q => `${q?.sectionIds?.at(-1)}__${q.id}`)
        .join('\n    ')}
}`
    }
}
