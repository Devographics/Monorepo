import { Survey, QuestionApiObject, SurveyApiObject, TypeDefTemplateOutput } from '../../types'
import { getFiltersTypeName } from '../../generate/helpers'
import uniq from 'lodash/uniq.js'

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
}): TypeDefTemplateOutput | undefined => {
    const typeName = getFiltersTypeName(survey.id)
    const surveyQuestions = questionObjects.filter(
        q => q.filterTypeName && q.surveyId === survey.id
    )
    if (surveyQuestions.length === 0) {
        return
    }

    // v1: when a question belongs to multiple sections in different surveys,
    // try to use the section from the most recent survey
    const sortedSurveyQuestions1 = surveyQuestions
        .sort((q1, q2) => q1?.sectionIds?.at(-1)?.localeCompare(q2?.sectionIds?.at(-1) ?? '') ?? 0)
        .sort((q1, q2) => (q1?.sectionIndex || 0) - (q2?.sectionIndex || 0))
    const filterQuestions1 = sortedSurveyQuestions1
        .map(q => `${q?.sectionIds?.at(-1)}__${q.id}: ${q.filterTypeName}`)
        .join('\n    ')

    // v2: when a question belongs to multiple sections in different surveys,
    // just generate filters for all sections
    const filterQuestions2 = surveyQuestions
        .map(q => {
            return uniq(q.sectionIds).map(sectionId => ({ ...q, sectionId }))
        })
        .flat()
    const sortedSurveyQuestions2 = filterQuestions2.sort(
        (q1, q2) => (q1?.sectionIndex || 0) - (q2?.sectionIndex || 0)
    )

    return {
        generatedBy: 'filters',
        typeName,
        typeDef: `input ${typeName} {
    ${sortedSurveyQuestions2
        .map(q => `${q?.sectionId}__${q.id}: ${q.filterTypeName}`)
        .join('\n    ')}
}`
    }
}
