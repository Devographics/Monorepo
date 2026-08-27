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
    getCorrelationDirection,
    getCorrelationQuestions,
    getCorrelationStrength,
    getMultiValueCorrelationQuestions,
    getMultiValueDbPaths,
    getSectionId,
    putQuestionFirst,
    round,
    splitCorrelationItems
} from './correlations_calculations'

export * from './correlations_calculations'

/*

Compute the correlation between every pair of ordered variables of an edition,
in a single pass over the normalized responses collection.

Everything is computed in-process: responses are fetched once with a projection
limited to each question's normalized paths, encoded as small integer arrays,
then each pair gets a contingency table from which we derive a signed,
tie-corrected Spearman rank correlation.

Only variables with an inherent order are paired, so every item has a signed
correlation ("more X goes with more Y"). That includes ordinal questions
(salary, experience…) and the binary variables expanded from individual answers
("picked it or not"); categorical questions like gender or os participate
through their per-answer expansions rather than as whole variables.

The full result is cached per-edition (survey data is immutable once an edition
closes).

*/

// how many (sorted) pairs to return at the edition level
export const EDITION_CORRELATIONS_LIMIT = 1000
// discard pairs below this correlation strength; answer expansion produces
// hundreds of binary variables, and keeping every near-zero pair would bloat
// the cached result with noise
const MIN_CORRELATION = 0.05
// bump to invalidate cached results when the algorithm changes
const CACHE_VERSION = 5

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
    // only pair variables with an inherent order, so that every pair gets a
    // signed correlation; categorical questions (gender, os…) participate
    // through their one-vs-rest expansions instead
    const orderedVariables = encodedQuestions.filter(encoded => encoded.isOrdinal)

    const items: CorrelationItem[] = []
    for (let i = 0; i < orderedVariables.length; i++) {
        const eq1 = orderedVariables[i]
        for (let j = i + 1; j < orderedVariables.length; j++) {
            const eq2 = orderedVariables[j]
            // options of the same question correlate structurally
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
            const stats = computePairStats(table, rows, cols, true)
            if (stats.n < MIN_PAIRWISE_N) continue
            const correlation = stats.spearman ?? 0
            if (Math.abs(correlation) < MIN_CORRELATION) continue

            const sectionId1 = getSectionId(eq1.question)
            const sectionId2 = getSectionId(eq2.question)
            const isAnswer = !!(eq1.optionId || eq2.optionId)
            items.push({
                questionId1: eq1.question.id,
                sectionId1,
                ...(eq1.optionId && { optionId1: eq1.optionId }),
                questionId2: eq2.question.id,
                sectionId2,
                ...(eq2.optionId && { optionId2: eq2.optionId }),
                n: stats.n,
                correlation: round(correlation),
                strength: getCorrelationStrength(correlation, isAnswer),
                direction: getCorrelationDirection(correlation),
                sameSection: !!sectionId1 && !!sectionId2 ? sectionId1 === sectionId2 : false
            })
        }
    }
    items.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation))

    return {
        editionId: edition.id,
        respondentCount: docs.length,
        questionCount: orderedVariables.length,
        items
    }
}

/*

Cached accessor: the heavy computation runs once per edition and is reused by
both the edition-level and question-level resolvers.

*/

const enableCache = true

export const getEditionCorrelations = async (options: ComputeOptions) => {
    const { edition, context } = options
    return (await useCache({
        key: computeKey('editionCorrelations', {
            editionId: edition.id,
            version: CACHE_VERSION
        }),
        func: computeEditionCorrelations,
        context,
        funcOptions: options,
        enableCache
    })) as EditionCorrelations
}

// how many items to return for each type of correlation array
const limit = 10

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

    const items = editionCorrelations.items
        .filter(item => item.questionId1 === question.id || item.questionId2 === question.id)
        // present the queried question consistently as side 1
        .map(item => putQuestionFirst(item, question.id))

    /*
    
    "Question correlations" relate two whole questions ("higher salary goes with
    more experience"); "answer correlations" involve one specific answer on at
    least one side ("respondents who picked X tend to…").
    
    */
    const isAnswerCorrelation = (item: CorrelationItem) => !!(item.optionId1 || item.optionId2)

    // items are already sorted by association strength, so both lists stay
    // sorted with the strongest correlations first
    const questionCorrelations = items.filter(item => !isAnswerCorrelation(item))
    /*
    Note: since the queried question is always side 1, answer items come in two
    shapes depending on the queried question's type. For categorical/multi
    questions the answer is the question's own ("gender:female × yearly_salary",
    optionId1 set); for ordinal scale questions it belongs to the other side
    ("job_happiness × workplace_perks:company_culture", optionId2 set).
    */
    const answerCorrelations = items.filter(isAnswerCorrelation)
    return {
        questionCorrelations: limit ? questionCorrelations.slice(0, limit) : questionCorrelations,
        answerCorrelations: limit ? answerCorrelations.slice(0, limit) : answerCorrelations
    }
}
