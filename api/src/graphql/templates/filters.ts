import { Survey, QuestionApiObject, SurveyApiObject, TypeDefTemplateOutput } from '../../types'
import { getFiltersTypeName } from '../../generate/helpers'

/*

Sample output:


input StateOfJsFilters {
    language__proxies: FeatureFilter
    language__promise_all_settled: FeatureFilter
    language__dynamic_import: FeatureFilter
    language__nullish_coalescing: FeatureFilter
    language__optional_chaining: FeatureFilter
    # etc.
}

Note: when a question appears in different sections in different editions,
use the most recent section.

*/

export const generateFiltersType = ({
    survey,
    questionObjects
}: {
    survey: SurveyApiObject
    questionObjects: QuestionApiObject[]
}): TypeDefTemplateOutput => {
    const typeName = getFiltersTypeName(survey.id)
    return {
        generatedBy: 'filters',
        typeName,
        typeDef: `input ${typeName} {
    ${questionObjects
        .filter(q => q.filterTypeName && q.surveyId === survey.id)
        .sort((q1, q2) => q1?.sectionIds?.at(-1)?.localeCompare(q2?.sectionIds?.at(-1) ?? '') ?? 0)
        .sort((q1, q2) => (q1?.sectionIndex || 0) - (q2?.sectionIndex || 0))
        .map(q => `${q?.sectionIds?.at(-1)}__${q.id}: ${q.filterTypeName}`)
        .join('\n    ')}
}`
    }
}
