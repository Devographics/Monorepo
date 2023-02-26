import { Survey, ParsedQuestion } from '../../generate/types'
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
    survey: Survey
    questionObjects: ParsedQuestion[]
}) => {
    const typeName = getFiltersTypeName(survey.id)
    return {
        typeName,
        typeDef: `input ${typeName} {
    ${questionObjects
        .filter(q => q.filterTypeName && q.surveyId === survey.id)
        .map(q => `${q.sectionIds.at(-1)}__${q.id}: ${q.filterTypeName}`)
        .join('\n    ')}
}`
    }
}
