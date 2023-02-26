import { Survey, ParsedQuestion } from '../../generate/types'
import { getFacetsTypeName } from './generateFieldType'

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
    survey: Survey
    questionObjects: ParsedQuestion[]
}) => {
    const typeName = getFacetsTypeName(survey.id)
    const questionObjectsWithFilters = questionObjects.filter(
        q => typeof q.filterTypeName !== 'undefined' && q.surveyId === survey.id
    )
    return {
        typeName,
        typeDef: `enum ${typeName} {
    ${questionObjectsWithFilters.map(q => `${q.sectionIds.at(-1)}__${q.id}`).join('\n    ')}
}`
    }
}
