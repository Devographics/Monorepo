import { RequestContext } from '../types'
import { EditionApiObject, QuestionApiObject, SurveyApiObject } from '../types/surveys'
import { getCollection } from '../helpers/db'
import { useCache, computeKey } from '../helpers/caching'
import {
    CorrelationItem,
    EditionCorrelations,
    EncodedQuestion,
    MIN_PAIRWISE_N,
    computePairStats,
    encodeMultiValueQuestion,
    encodeQuestion,
    expandCategoricalOptions,
    getCorrelationQuestions,
    getMultiValueCorrelationQuestions,
    getMultiValueDbPaths,
    getSectionId,
    round
} from './correlations_calculations'

export * from './correlations_calculations'

/*

Compute the association strength between every pair of (single-answer, predefined-options)
questions of an edition, in a single pass over the normalized responses collection.

All pairwise metrics are computed in-process: responses are fetched once with a projection
limited to each question's normPaths.response, encoded as small integer arrays, then each
pair gets a contingency table from which we derive:

- bias-corrected Cramér's V (0-1, works for any pair of categorical questions), used for ranking
- Spearman's rank correlation (signed, only when both questions are ordinal)

The full result is cached per-edition (survey data is immutable once an edition closes).

*/

// how many (sorted) pairs to return at the edition level
export const EDITION_CORRELATIONS_LIMIT = 1000
// discard pairs below this association strength; multi-value questions expand
// into hundreds of binary variables, and keeping every near-zero pair would
// bloat the cached result with noise
const MIN_CRAMERS_V = 0.05
// bump to invalidate cached results when the algorithm changes
const CACHE_VERSION = 3

interface ComputeOptions {
    survey: SurveyApiObject
    edition: EditionApiObject
    questionObjects: QuestionApiObject[]
    context: RequestContext
}

export async function computeEditionCorrelations(
    options: ComputeOptions
): Promise<EditionCorrelations> {
    const { survey, edition, questionObjects, context } = options
    const { db } = context

    const questions = getCorrelationQuestions({ questionObjects, edition })
    const multiValueQuestions = getMultiValueCorrelationQuestions({ questionObjects, edition })

    const projection: { [key: string]: 0 | 1 } = { _id: 0 }
    for (const question of questions) {
        projection[question.normPaths!.response!] = 1
    }
    for (const question of multiValueQuestions) {
        for (const dbPath of getMultiValueDbPaths(question)) {
            projection[dbPath] = 1
        }
    }
    const collection = getCollection(db, survey)
    const docs = await collection
        .find({ surveyId: survey.id, editionId: edition.id }, { projection })
        .toArray()

    const singleEncoded = questions
        .map(question => encodeQuestion(question, docs))
        .filter((e): e is EncodedQuestion => e !== null)
    const encodedQuestions = [
        ...singleEncoded,
        // one-vs-rest binary variables for each option of categorical questions
        ...singleEncoded.flatMap(encoded => expandCategoricalOptions(encoded)),
        ...multiValueQuestions.flatMap(question => encodeMultiValueQuestion(question, docs))
    ]

    const items: CorrelationItem[] = []
    for (let i = 0; i < encodedQuestions.length; i++) {
        const eq1 = encodedQuestions[i]
        for (let j = i + 1; j < encodedQuestions.length; j++) {
            const eq2 = encodedQuestions[j]
            // options of the same multi-value question correlate structurally
            // (they compete for the same selections), skip them
            if (eq1.question.id === eq2.question.id) continue
            const rows = eq1.cardinality
            const cols = eq2.cardinality
            const table = new Int32Array(rows * cols)
            const codes1 = eq1.codes
            const codes2 = eq2.codes
            for (let k = 0; k < docs.length; k++) {
                const a = codes1[k]
                if (a < 0) continue
                const b = codes2[k]
                if (b < 0) continue
                table[a * cols + b]++
            }
            const stats = computePairStats(table, rows, cols, eq1.isOrdinal && eq2.isOrdinal)
            if (stats.n < MIN_PAIRWISE_N) continue
            if (stats.cramersV < MIN_CRAMERS_V) continue

            const sectionId1 = getSectionId(eq1.question)
            const sectionId2 = getSectionId(eq2.question)
            items.push({
                questionId1: eq1.question.id,
                sectionId1,
                ...(eq1.optionId && { optionId1: eq1.optionId }),
                questionId2: eq2.question.id,
                sectionId2,
                ...(eq2.optionId && { optionId2: eq2.optionId }),
                n: stats.n,
                cramersV: round(stats.cramersV),
                spearman: stats.spearman === null ? null : round(stats.spearman),
                sameSection: !!sectionId1 && !!sectionId2 ? sectionId1 === sectionId2 : false
            })
        }
    }
    items.sort((a, b) => b.cramersV - a.cramersV)

    return {
        editionId: edition.id,
        respondentCount: docs.length,
        questionCount: encodedQuestions.length,
        items
    }
}

/*

Cached accessor: the heavy computation runs once per edition and is reused by
both the edition-level and question-level resolvers.

*/
export const getEditionCorrelations = async (options: ComputeOptions) => {
    const { edition, context } = options
    return (await useCache({
        key: computeKey('editionCorrelations', {
            editionId: edition.id,
            version: CACHE_VERSION
        }),
        func: computeEditionCorrelations,
        context,
        funcOptions: options
    })) as EditionCorrelations
}

export const getQuestionCorrelations = async ({
    survey,
    edition,
    question,
    questionObjects,
    context
}: ComputeOptions & { question: QuestionApiObject }) => {
    const editionCorrelations = await getEditionCorrelations({
        survey,
        edition,
        questionObjects,
        context
    })
    const items = editionCorrelations.items.filter(item => item.questionId1 === question.id)
    return items
}
