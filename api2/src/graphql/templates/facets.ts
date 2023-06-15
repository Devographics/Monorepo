import { Survey, QuestionApiObject, SurveyApiObject } from '../../types/surveys'
import { getFacetsTypeName } from '../../generate/helpers'

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
}) => {
    const typeName = getFacetsTypeName(survey.id)
    const questionObjectsWithFilters = questionObjects.filter(
        q => typeof q.filterTypeName !== 'undefined' && q.surveyId === survey.id
    )
    return {
        typeName,
        typeDef: `enum ${typeName} {
    ${questionObjectsWithFilters
        .sort((q1, q2) => q1.sectionIds.at(-1)?.localeCompare(q2.sectionIds.at(-1) ?? '') ?? 0)
        .sort((q1, q2) => q1.sectionIndex - q2.sectionIndex)
        .map(q => `${q.sectionIds.at(-1)}__${q.id}`)
        .join('\n    ')}
}`
    }
}
