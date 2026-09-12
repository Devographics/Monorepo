import { ResponseEditionData } from '@devographics/types'
import { RequestContext } from '../../types'
import { getQuestionCardinalities, hasCardinalities } from '../../compute/question_cardinalities'
import { EditionDataQueryContext } from './editions'

/*

Fields of ResponseEditionData that are computed on their own rather than coming
out of the generic compute pipeline.

The edition data objects are plain cached data, so they carry no reference to
the query they came from. `allEditionsResolver` attaches the survey and question
to each one (see `attachQueryContext` there) so these resolvers can find them.

*/

type ResponseEditionDataParent = ResponseEditionData & Partial<EditionDataQueryContext>

export const responseEditionDataResolverMap = {
    /*

    Answer-count distribution for the question this data belongs to.

    Describes the same population as the buckets it sits next to: scoped to the
    edition of its own data object (so under `allEditions` each entry reports its
    own edition) and to the filters of the field it is queried under. Querying a
    question under a `gender` filter therefore answers "how many workplace issues
    do women report", and comparing two filtered queries answers "vs men".

    Presentation parameters — cutoff, limit, sort — are not applied: they choose
    which buckets to display, which says nothing about how many answers a
    respondent selected.

    Null for questions that accept a single answer, where the distribution would
    be nothing but 1s.

    */
    _cardinalities: async (
        parent: ResponseEditionDataParent,
        args: any,
        context: RequestContext
    ) => {
        const { survey, question, editionId, questionObjects, filters } = parent
        // reached through a path that does not attach the query context
        if (!survey || !question) {
            return null
        }
        if (!hasCardinalities(question)) {
            return null
        }
        const edition = survey.editions?.find(e => e.id === editionId)
        if (!edition) {
            return null
        }
        console.log(`// response edition data cardinalities resolver: ${question.id}`)
        return await getQuestionCardinalities({
            survey,
            edition,
            question,
            context,
            filters,
            questionObjects
        })
    }
}
