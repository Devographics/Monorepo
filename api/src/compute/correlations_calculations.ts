import get from 'lodash/get.js'
import { NO_ANSWER, INVALID_VALUES } from '@devographics/constants'
import type { EditionApiObject, QuestionApiObject } from '../types/surveys'

/*

Pure calculation helpers for question correlations: question eligibility,
response encoding, and pair statistics. Kept free of db/caching imports so
they stay easily unit-testable; the orchestration lives in correlations.ts.

*/

// discard pairs with fewer respondents than this having answered both questions
export const MIN_PAIRWISE_N = 100
// skip questions with more distinct values than this (e.g. country)
export const MAX_CARDINALITY = 30
// binary (per-option) variables need at least this many respondents on each
// side (selected/not selected) to be worth correlating
export const MIN_OPTION_SELECTIONS = 30

/*

Survey-process meta questions: they generate statistically valid but
uninteresting pairs (e.g. people who skipped questions also skipped other
questions), so keep them out of the correlations dataset entirely.

*/
export const EXCLUDED_QUESTION_IDS = [
    'authmode',
    'completion_stats',
    'did_you_run_into_technical_issues',
    'how_can_we_improve',
    'how_did_user_find_out_about_the_survey',
    'knowledge_score',
    'missing_questions',
    'skipped',
    'source',
    'survey_feedback'
]

export type CorrelationStrength = 'very_strong' | 'strong' | 'moderate' | 'weak'
export type CorrelationDirection = 'positive' | 'negative'

/*

Strength bands (lower bound of |correlation| for each label).

Answer correlations use lower thresholds: a binary "picked it or not" variable
has a mechanical ceiling below 1 unless its pick-rate matches the other
variable's distribution, so the same numeric value represents a stronger effect
than it would between two full scales.

*/
export const QUESTION_STRENGTH_BANDS: [CorrelationStrength, number][] = [
    ['very_strong', 0.5],
    ['strong', 0.3],
    ['moderate', 0.15]
]
export const ANSWER_STRENGTH_BANDS: [CorrelationStrength, number][] = [
    ['very_strong', 0.4],
    ['strong', 0.25],
    ['moderate', 0.1]
]

export const getCorrelationStrength = (
    correlation: number,
    isAnswerCorrelation: boolean
): CorrelationStrength => {
    const bands = isAnswerCorrelation ? ANSWER_STRENGTH_BANDS : QUESTION_STRENGTH_BANDS
    const value = Math.abs(correlation)
    for (const [strength, lowerBound] of bands) {
        if (value >= lowerBound) {
            return strength
        }
    }
    return 'weak'
}

export const getCorrelationDirection = (correlation: number): CorrelationDirection =>
    correlation < 0 ? 'negative' : 'positive'

export interface CorrelationItem {
    questionId1: string
    sectionId1?: string
    // set when the variable is one option of a multi-value question
    optionId1?: string
    questionId2: string
    sectionId2?: string
    optionId2?: string
    // number of respondents who answered both questions
    n: number
    /*
    Signed Spearman rank correlation (-1 to 1): positive means higher values of
    one variable go with higher values of the other (for answers: picking the
    answer goes with higher values), negative means the reverse. Only pairs of
    ordered variables (ordinal questions and binary answer variables) are
    correlated, so this is always defined.
    */
    correlation: number
    strength: CorrelationStrength
    direction: CorrelationDirection
    sameSection: boolean
}

export interface EditionCorrelations {
    editionId: string
    respondentCount: number
    questionCount: number
    items: CorrelationItem[]
}

export const getSectionId = (question: QuestionApiObject) =>
    question.section?.id ?? question.sectionIds?.[0]

/*

"Question correlations" relate two whole questions ("higher salary goes with
more experience"); "answer correlations" involve one specific answer on at
least one side ("respondents who picked X tend to…").

*/
export const isAnswerCorrelation = (item: CorrelationItem) => !!(item.optionId1 || item.optionId2)

/*

Pairs are stored once in arbitrary order; when returning the correlations of a
specific question, put that question on side 1 so results read consistently
("this question × everything else"). Rank correlation is symmetric, so
swapping sides changes nothing else.

*/
export const putQuestionFirst = (item: CorrelationItem, questionId: string): CorrelationItem =>
    item.questionId2 === questionId
        ? {
              ...item,
              questionId1: item.questionId2,
              sectionId1: item.sectionId2,
              optionId1: item.optionId2,
              questionId2: item.questionId1,
              sectionId2: item.sectionId1,
              optionId2: item.optionId1
          }
        : item

export const splitCorrelationItems = (items: CorrelationItem[], limit?: number) => {
    // items are already sorted by association strength, so both lists stay
    // sorted with the strongest correlations first
    const questionCorrelations = items.filter(item => !isAnswerCorrelation(item))
    const answerCorrelations = items.filter(isAnswerCorrelation)
    return {
        questionCorrelations: limit ? questionCorrelations.slice(0, limit) : questionCorrelations,
        answerCorrelations: limit ? answerCorrelations.slice(0, limit) : answerCorrelations
    }
}

const isEligibleQuestion = (q: QuestionApiObject, edition: EditionApiObject) =>
    !!(
        q.editions?.includes(edition.id) &&
        q.hasApiEndpoint !== false &&
        q.includeInApi !== false &&
        !EXCLUDED_QUESTION_IDS.includes(q.id)
    )

/*

Single-answer questions with normalized responses: correlated as one
categorical variable each.

*/
export const getCorrelationQuestions = ({
    questionObjects,
    edition
}: {
    questionObjects: QuestionApiObject[]
    edition: EditionApiObject
}) =>
    questionObjects.filter(
        q => !!q.normPaths?.response && !q.allowMultiple && isEligibleQuestion(q, edition)
    )

/*

Multi-value questions (multiple selections, or freeform lists like textList):
each option becomes its own binary selected/not-selected variable. Questions
without predefined options rely on the dynamic options (top X most popular
answers) attached to them at schema generation time by addQuestionOptions().

*/
export const getMultiValueCorrelationQuestions = ({
    questionObjects,
    edition
}: {
    questionObjects: QuestionApiObject[]
    edition: EditionApiObject
}) =>
    questionObjects.filter(
        q => !!q.allowMultiple && !!q.options?.length && isEligibleQuestion(q, edition)
    )

/*

For multi-value questions, answers can live at different paths depending on the
question type: predefined choices under "response", normalized freeform answers
under "other", prenormalized values under "prenormalized". Read all of them.

*/
export const getMultiValueDbPaths = (q: QuestionApiObject) => {
    const { response, other, prenormalized } = q.normPaths ?? {}
    return [response, other, prenormalized].filter((p): p is string => !!p)
}

export const isOrdinalQuestion = (q: QuestionApiObject) =>
    !!q.options && !!(q.optionsAreSequential || q.optionsAreNumeric || q.optionsAreRange)

export interface EncodedQuestion {
    question: QuestionApiObject
    // for binary variables expanded from a multi-value question's option
    optionId?: string
    isOrdinal: boolean
    // number of distinct answer values
    cardinality: number
    // one entry per respondent; value index, or -1 when unanswered
    codes: Int16Array
}

const isMissing = (value: any) =>
    value === null ||
    value === undefined ||
    value === '' ||
    value === NO_ANSWER ||
    INVALID_VALUES.includes(value)

/*

Encode one question's answers across all respondents as value indices.

For questions with predefined options, indices follow the options order (so that
they can double as ranks for ordinal questions); values not matching any option
are treated as unanswered. For questions without options, the index mapping is
built from the data, and the question is dropped if it exceeds MAX_CARDINALITY.

*/
export const encodeQuestion = (
    question: QuestionApiObject,
    docs: any[]
): EncodedQuestion | null => {
    const dbPath = question.normPaths?.response as string
    const codes = new Int16Array(docs.length).fill(-1)
    const valueIndex = new Map<string, number>()
    const hasOptions = !!question.options?.length
    if (hasOptions) {
        question.options!.forEach((option, index) => {
            valueIndex.set(String(option.id), index)
        })
        if (valueIndex.size > MAX_CARDINALITY) {
            return null
        }
    }
    const seen = new Set<number>()
    docs.forEach((doc, docIndex) => {
        let value = get(doc, dbPath)
        // defensive: normalized single-answer values can still be stored as arrays
        if (Array.isArray(value)) {
            value = value.length === 1 ? value[0] : undefined
        }
        if (isMissing(value)) {
            return
        }
        const key = String(value)
        let index = valueIndex.get(key)
        if (index === undefined) {
            if (hasOptions) {
                // ignore values that don't match any predefined option
                return
            }
            if (valueIndex.size >= MAX_CARDINALITY) {
                // over cardinality limit, question will be dropped below
                valueIndex.set(key, MAX_CARDINALITY)
                return
            }
            index = valueIndex.size
            valueIndex.set(key, index)
        }
        codes[docIndex] = index
        seen.add(index)
    })
    if (!hasOptions && valueIndex.size > MAX_CARDINALITY) {
        return null
    }
    // need at least two distinct observed values for any association to exist
    if (seen.size < 2) {
        return null
    }
    const q = {
        question,
        isOrdinal: isOrdinalQuestion(question),
        cardinality: hasOptions ? question.options!.length : valueIndex.size,
        codes
    }
    return q
}

/*

Encode a multi-value question as one binary variable per option:
1 = selected, 0 = answered the question but did not select this option,
-1 = did not answer the question at all.

Binary variables are marked ordinal (not-selected < selected) so that pairs
involving them get a signed Spearman coefficient indicating direction.

*/
export const encodeMultiValueQuestion = (
    question: QuestionApiObject,
    docs: any[],
    minSelections: number = MIN_OPTION_SELECTIONS
): EncodedQuestion[] => {
    const options = question.options ?? []
    if (options.length === 0 || options.length > MAX_CARDINALITY) {
        return []
    }
    const dbPaths = getMultiValueDbPaths(question)
    if (dbPaths.length === 0) {
        return []
    }
    const optionIndex = new Map<string, number>()
    options.forEach((option, index) => {
        optionIndex.set(String(option.id), index)
    })
    const codesPerOption = options.map(() => new Int16Array(docs.length).fill(-1))
    docs.forEach((doc, docIndex) => {
        let answered = false
        const selected = new Set<number>()
        for (const dbPath of dbPaths) {
            let values = get(doc, dbPath)
            if (values === null || values === undefined || values === '') {
                continue
            }
            if (!Array.isArray(values)) {
                values = [values]
            }
            for (const value of values) {
                if (isMissing(value)) {
                    continue
                }
                answered = true
                const index = optionIndex.get(String(value))
                if (index !== undefined) {
                    selected.add(index)
                }
            }
        }
        if (answered) {
            codesPerOption.forEach((codes, optionIdx) => {
                codes[docIndex] = selected.has(optionIdx) ? 1 : 0
            })
        }
    })
    return (
        options
            .map((option, index) => ({
                question,
                optionId: String(option.id),
                isOrdinal: true,
                cardinality: 2,
                codes: codesPerOption[index]
            }))
            // drop options without enough respondents on both sides
            .filter(encoded => hasEnoughSelections(encoded.codes, minSelections))
    )
}

const hasEnoughSelections = (codes: Int16Array, minSelections: number) => {
    let selected = 0
    let unselected = 0
    for (const code of codes) {
        if (code === 1) selected++
        else if (code === 0) unselected++
        if (selected >= minSelections && unselected >= minSelections) return true
    }
    return false
}

/*

One-vs-rest expansion for single-answer categorical (non-ordinal) questions:
each option also becomes a binary "picked it / picked something else" variable,
so that findings like "respondents who picked X rank lower on Y" (signed
Spearman, i.e. rank-biserial correlation) become visible. Ordinal questions are
not expanded since their option order already carries that information.

Operates on the already-encoded question to avoid re-reading the documents.

*/
export const expandCategoricalOptions = (
    encoded: EncodedQuestion,
    minSelections: number = MIN_OPTION_SELECTIONS
): EncodedQuestion[] => {
    const { question, isOrdinal, codes } = encoded
    if (isOrdinal) {
        return []
    }
    const options = question.options
    if (!options?.length) {
        // without an options list there is no stable id to label the variable with
        return []
    }
    return options
        .map((option, optionIdx) => {
            const binaryCodes = new Int16Array(codes.length)
            for (let i = 0; i < codes.length; i++) {
                const code = codes[i]
                binaryCodes[i] = code < 0 ? -1 : code === optionIdx ? 1 : 0
            }
            return {
                question,
                optionId: String(option.id),
                isOrdinal: true,
                cardinality: 2,
                codes: binaryCodes
            }
        })
        .filter(binary => hasEnoughSelections(binary.codes, minSelections))
}

export interface PairStats {
    n: number
    cramersV: number
    spearman: number | null
}

/*

Compute pair statistics from a contingency table (rows × cols, row-major).

Cramér's V uses the Bergsma bias correction. Categories with an empty marginal
in the pairwise-complete subset are ignored when counting rows/columns.

Spearman's rho is computed from the table using average (tie-corrected) ranks,
which is exact for tied data; it is only meaningful when both variables are
ordinal, so callers pass `includeSpearman` accordingly.

*/
export const computePairStats = (
    table: Int32Array,
    rows: number,
    cols: number,
    includeSpearman: boolean
): PairStats => {
    const rowSums = new Array(rows).fill(0)
    const colSums = new Array(cols).fill(0)
    let n = 0
    for (let x = 0; x < rows; x++) {
        for (let y = 0; y < cols; y++) {
            const count = table[x * cols + y]
            rowSums[x] += count
            colSums[y] += count
            n += count
        }
    }
    const nonEmptyRows = rowSums.filter(s => s > 0).length
    const nonEmptyCols = colSums.filter(s => s > 0).length
    if (n === 0 || nonEmptyRows < 2 || nonEmptyCols < 2) {
        return { n, cramersV: 0, spearman: null }
    }

    // chi-square over cells with non-empty marginals
    let chi2 = 0
    for (let x = 0; x < rows; x++) {
        if (rowSums[x] === 0) continue
        for (let y = 0; y < cols; y++) {
            if (colSums[y] === 0) continue
            const expected = (rowSums[x] * colSums[y]) / n
            const delta = table[x * cols + y] - expected
            chi2 += (delta * delta) / expected
        }
    }

    // bias-corrected Cramér's V (Bergsma 2013)
    const phi2 = chi2 / n
    const r = nonEmptyRows
    const c = nonEmptyCols
    const phi2Corrected = Math.max(0, phi2 - ((r - 1) * (c - 1)) / (n - 1))
    const rCorrected = r - ((r - 1) * (r - 1)) / (n - 1)
    const cCorrected = c - ((c - 1) * (c - 1)) / (n - 1)
    const denominator = Math.min(rCorrected, cCorrected) - 1
    const cramersV = denominator > 0 ? Math.sqrt(phi2Corrected / denominator) : 0

    let spearman: number | null = null
    if (includeSpearman) {
        // average rank of each category, in option order
        const rowRanks = new Array(rows).fill(0)
        const colRanks = new Array(cols).fill(0)
        let cumulative = 0
        for (let x = 0; x < rows; x++) {
            rowRanks[x] = cumulative + (rowSums[x] + 1) / 2
            cumulative += rowSums[x]
        }
        cumulative = 0
        for (let y = 0; y < cols; y++) {
            colRanks[y] = cumulative + (colSums[y] + 1) / 2
            cumulative += colSums[y]
        }
        const meanRank = (n + 1) / 2
        let covariance = 0
        let varianceX = 0
        let varianceY = 0
        for (let x = 0; x < rows; x++) {
            varianceX += rowSums[x] * (rowRanks[x] - meanRank) ** 2
        }
        for (let y = 0; y < cols; y++) {
            varianceY += colSums[y] * (colRanks[y] - meanRank) ** 2
        }
        for (let x = 0; x < rows; x++) {
            for (let y = 0; y < cols; y++) {
                const count = table[x * cols + y]
                if (count > 0) {
                    covariance += count * (rowRanks[x] - meanRank) * (colRanks[y] - meanRank)
                }
            }
        }
        spearman =
            varianceX > 0 && varianceY > 0 ? covariance / Math.sqrt(varianceX * varianceY) : 0
    }

    return { n, cramersV, spearman }
}

export const round = (value: number) => Math.round(value * 10000) / 10000
