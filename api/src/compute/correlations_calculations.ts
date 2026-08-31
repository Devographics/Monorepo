import get from 'lodash/get.js'
import { NO_ANSWER, INVALID_VALUES, NO_MATCH } from '@devographics/constants'
import { OPTION_NA } from '@devographics/types'
import type {
    CorrelationDirection,
    CorrelationItem,
    CorrelationStrength,
    OptionCorrelations,
    OptionGroup
} from '@devographics/types'
import type { EditionApiObject, QuestionApiObject } from '../types/surveys'
import {
    CORRELATION_STRENGTH_BANDS,
    EXCLUDED_QUESTION_IDS,
    MAX_CARDINALITY,
    MIN_OPTION_SELECTIONS,
    OPTION_CORRELATIONS_LIMIT,
    QUESTION_CORRELATIONS_LIMIT
} from './correlations_constants'

// the tuning knobs live in their own module; re-exported so importers of this
// one keep working
export * from './correlations_constants'

// re-exported so callers can keep importing correlation types from here
export type { CorrelationDirection, CorrelationItem, CorrelationStrength, OptionCorrelations }

/*

Pure calculation helpers for question correlations: question eligibility,
response encoding, and pair statistics. Kept free of db/caching imports so
they stay easily unit-testable; the orchestration lives in correlations.ts.

*/

export const getCorrelationStrength = (correlation: number): CorrelationStrength => {
    const value = Math.abs(correlation)
    for (const [strength, lowerBound] of CORRELATION_STRENGTH_BANDS) {
        if (value >= lowerBound) {
            return strength
        }
    }
    return 'weak'
}

export const getCorrelationDirection = (correlation: number): CorrelationDirection =>
    correlation < 0 ? 'negative' : 'positive'

// weakest to strongest
export const CORRELATION_STRENGTHS: CorrelationStrength[] = [
    'weak',
    'moderate',
    'strong',
    'very_strong'
]

/*

Keep only correlations worth showing: strong enough to mean something, and at
most `limit` of them. Filtering happens before the limit, so a weak item can
never consume one of the slots.

*/
export const filterCorrelations = (
    items: CorrelationItem[],
    { minStrength = 'moderate', limit }: { minStrength?: CorrelationStrength; limit?: number } = {}
) => {
    const minIndex = CORRELATION_STRENGTHS.indexOf(minStrength)
    const filtered = items.filter(item => CORRELATION_STRENGTHS.indexOf(item.strength) >= minIndex)
    return limit === undefined ? filtered : filtered.slice(0, limit)
}

// the full computed (and cached) result for one edition
export interface ComputedCorrelations {
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

/*

Rules applied to one card's ranked list of correlations, to stop it spending
slots on weaker restatements of something already shown.

Currently one rule: once a correlation with a whole question is shown ("scoring
higher on the political spectrum"), correlations with that same question's
individual answers ("answered far-left") are dropped, since the trend already
says it and says it more generally. Only weaker ones are affected — the list
arrives sorted strongest-first.

*/
export const applyCorrelationRules = (items: CorrelationItem[]) => {
    // questions already covered by a correlation with the question as a whole
    const coveredByTrend = new Set<string>()
    return items.filter(item => {
        if (!item.optionId2) {
            coveredByTrend.add(item.questionId2)
            return true
        }
        return !coveredByTrend.has(item.questionId2)
    })
}

/*

Build the correlations payload for a single question, from the (already
filtered and side-normalised) items involving it.

Items involving one of the question's own answers are grouped under that answer,
to drive per-option indicators. Everything else describes the question as a
whole, whether the other side is another question ("yearly_salary ×
company_size") or one of its answers ("yearly_salary ×
workplace_perks:compensation").

Questions whose options have an order populate both sides: they take part as a
whole scale (the trend) and through their individual bands. Questions like
gender have no whole-scale form, so they only ever populate the option groups.

*/
export const splitQuestionCorrelations = (
    items: CorrelationItem[],
    question: QuestionApiObject,
    minStrength: CorrelationStrength = 'moderate'
) => {
    // only keep correlations worth putting in front of a reader
    const shownItems = filterCorrelations(items, { minStrength })

    const questionCorrelations = applyCorrelationRules(
        shownItems.filter(item => !item.optionId1)
    ).slice(0, QUESTION_CORRELATIONS_LIMIT)

    // items arrive sorted strongest-first, so each group keeps that order.
    // Groups are collected in full and capped further down, after the rules
    // have run, so that a suppressed correlation never consumes a slot.
    const itemsByOption = new Map<string, CorrelationItem[]>()
    for (const item of shownItems) {
        const { optionId1 } = item
        if (!optionId1) continue
        const groupItems = itemsByOption.get(optionId1)
        if (!groupItems) {
            itemsByOption.set(optionId1, [item])
        } else {
            groupItems.push(item)
        }
    }
    // follow the question's own option order so groups line up with its buckets;
    // answers with no declared option (a question indexed from the data, or a
    // value outside the declared list) keep their strength order at the end
    // questions that collect a raw value declare groups rather than options, and
    // those groups are the buckets the chart renders
    const declaredIds = question.options?.length
        ? question.options.map(option => String(option.id))
        : (question.groups ?? []).map(group => String(group.id))
    const declaredOrder = declaredIds.filter(id => itemsByOption.has(id))
    const remaining = [...itemsByOption.keys()].filter(id => !declaredOrder.includes(id))
    const optionCorrelations: OptionCorrelations[] = [...declaredOrder, ...remaining]
        .map(id => ({
            id,
            correlations: applyCorrelationRules(itemsByOption.get(id)!).slice(
                0,
                OPTION_CORRELATIONS_LIMIT
            )
        }))

    return { questionCorrelations, optionCorrelations }
}

export const splitEditionCorrelations = (items: CorrelationItem[], limit?: number) => {
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
each answer becomes its own binary selected/not-selected variable. The answers
are read from the data, so a question needs no predefined option list to take
part.

*/
export const getMultiValueCorrelationQuestions = ({
    questionObjects,
    edition
}: {
    questionObjects: QuestionApiObject[]
    edition: EditionApiObject
}) =>
    questionObjects.filter(
        q =>
            !!q.allowMultiple &&
            getMultiValueDbPaths(q).length > 0 &&
            isEligibleQuestion(q, edition)
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

/*

Two non-answers correlating only says that some people skipped both questions,
which is a fact about survey completion rather than about respondents.

Only pairs where BOTH sides are non-answers are dropped: a single non-answer
against a real answer can still be informative (who declines to say).

*/
/*

Questions can opt out of being correlated with specific other questions via
`doNotCorrelateWith` in the survey outline, for relationships that are
definitional rather than informative (race and country of origin, say).

The check is symmetric, so the field only has to be declared on one side.

*/
export const isBlockedPair = (question1: QuestionApiObject, question2: QuestionApiObject) =>
    !!question1.doNotCorrelateWith?.includes(question2.id) ||
    !!question2.doNotCorrelateWith?.includes(question1.id)

/*

NO_MATCH marks a free-form answer that normalisation could not match to any
entity. It describes the pipeline's coverage rather than the respondent, so it
never becomes a variable at all — unlike `na`, which is an answer someone
deliberately chose.

*/
export const isNormalizationArtifact = (value: string) => value === NO_MATCH

export const isNonAnswerPair = (optionId1?: string, optionId2?: string) =>
    optionId1 === OPTION_NA && optionId2 === OPTION_NA

/*

A question is ordinal when its answers have an inherent order, which can come
from two places: a declared list of options in a meaningful sequence (salary
bands), or numeric answers that carry their own order with no option list at
all (years of experience, age — templates like `years` supply display `groups`
rather than options).

*/
export const isOrdinalQuestion = (q: QuestionApiObject) => {
    if (q.options?.length) {
        return !!(q.optionsAreSequential || q.optionsAreNumeric || q.optionsAreRange)
    }
    return !!q.optionsAreNumeric || q.contentType === 'number'
}

// the two states of a binary "picked it or not" variable
const BINARY_VALUES = ['0', '1']

export interface EncodedQuestion {
    question: QuestionApiObject
    // for binary variables expanded from a multi-value question's option
    optionId?: string
    isOrdinal: boolean
    // the answer value at each index, in code order
    values: string[]
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

Ordinal questions keep their declared option order, because those indices double
as ranks and reordering them would make the correlation meaningless.

Every other question is indexed by what respondents actually answered, most
common value first, keeping the top MAX_CARDINALITY. That way a question with a
huge predefined option list (country has 249) still takes part through its most
common answers, instead of being dropped wholesale, and questions with no
predefined options work the same way.

*/
export const encodeQuestion = (
    question: QuestionApiObject,
    docs: any[],
    maxCardinality: number = MAX_CARDINALITY
): EncodedQuestion | null => {
    const dbPath = question.normPaths?.response as string
    const isOrdinal = isOrdinalQuestion(question)

    // read each respondent's answer once
    const keys: (string | null)[] = docs.map(doc => {
        let value = get(doc, dbPath)
        // defensive: normalized single-answer values can still be stored as arrays
        if (Array.isArray(value)) {
            value = value.length === 1 ? value[0] : undefined
        }
        return isMissing(value) ? null : String(value)
    })

    const counts = new Map<string, number>()
    for (const key of keys) {
        if (key !== null) {
            counts.set(key, (counts.get(key) ?? 0) + 1)
        }
    }
    // any observed value is eligible, whether or not it was predefined:
    // questions that offer an "other…" field produce perfectly good answers
    // that appear nowhere in the option list
    const mostCommon = [...counts.entries()]
        .filter(([key]) => !isNormalizationArtifact(key))
        .sort((a, b) => b[1] - a[1])
        .slice(0, maxCardinality)
        .map(([key]) => key)

    let values: string[]
    if (isOrdinal && question.options?.length) {
        // declared bands: option order is the rank order, so it cannot be
        // rebuilt from the data, and a scale with more bands than the cap is
        // left out rather than truncated
        values = question.options.map(option => String(option.id))
        if (values.length > maxCardinality) {
            return null
        }
    } else if (isOrdinal) {
        // numeric answers with no declared options carry their own order: keep
        // the most common, then restore numeric order so the indices are ranks
        values = [...mostCommon].sort((a, b) => Number(a) - Number(b))
    } else {
        values = mostCommon
    }

    const valueIndex = new Map(values.map((value, index) => [value, index]))
    const codes = new Int16Array(docs.length).fill(-1)
    const seen = new Set<number>()
    keys.forEach((key, docIndex) => {
        if (key === null) return
        const index = valueIndex.get(key)
        // values outside the kept set (or matching no option) count as unanswered
        if (index === undefined) return
        codes[docIndex] = index
        seen.add(index)
    })

    // need at least two distinct observed values for any association to exist
    if (seen.size < 2) {
        return null
    }
    return {
        question,
        isOrdinal,
        values,
        cardinality: values.length,
        codes
    }
}

/*

Encode a multi-value question as one binary variable per answer:
1 = selected, 0 = answered the question but did not select this answer,
-1 = did not answer the question at all.

The answers are taken from the data rather than from the question's option list,
most common first, so that normalised free-form answers from an "other…" field
count alongside the predefined ones.

Binary variables are marked ordinal (not-selected < selected) so that pairs
involving them get a signed Spearman coefficient indicating direction.

*/
export const encodeMultiValueQuestion = (
    question: QuestionApiObject,
    docs: any[],
    minSelections: number = MIN_OPTION_SELECTIONS,
    maxCardinality: number = MAX_CARDINALITY
): EncodedQuestion[] => {
    const dbPaths = getMultiValueDbPaths(question)
    if (dbPaths.length === 0) {
        return []
    }

    // read each respondent's answers once, across every path the question uses
    const answersPerDoc: string[][] = docs.map(doc => {
        const answers: string[] = []
        for (const dbPath of dbPaths) {
            let values = get(doc, dbPath)
            if (values === null || values === undefined || values === '') {
                continue
            }
            if (!Array.isArray(values)) {
                values = [values]
            }
            for (const value of values) {
                if (!isMissing(value)) {
                    answers.push(String(value))
                }
            }
        }
        return answers
    })

    // count respondents per answer (not occurrences: the same answer can arrive
    // from both the predefined and the free-form path), keep the most common
    const counts = new Map<string, number>()
    for (const answers of answersPerDoc) {
        for (const answer of new Set(answers)) {
            counts.set(answer, (counts.get(answer) ?? 0) + 1)
        }
    }
    const values = [...counts.entries()]
        .filter(([value]) => !isNormalizationArtifact(value))
        .sort((a, b) => b[1] - a[1])
        .slice(0, maxCardinality)
        .map(([value]) => value)
    if (values.length === 0) {
        return []
    }

    const valueIndex = new Map(values.map((value, index) => [value, index]))
    const codesPerValue = values.map(() => new Int16Array(docs.length).fill(-1))
    answersPerDoc.forEach((answers, docIndex) => {
        // no answers at all means the respondent skipped the question
        if (answers.length === 0) return
        const selected = new Set<number>()
        for (const answer of answers) {
            const index = valueIndex.get(answer)
            if (index !== undefined) {
                selected.add(index)
            }
        }
        codesPerValue.forEach((codes, index) => {
            codes[docIndex] = selected.has(index) ? 1 : 0
        })
    })

    return (
        values
            .map((value, index) => ({
                question,
                optionId: value,
                isOrdinal: true,
                values: BINARY_VALUES,
                cardinality: 2,
                codes: codesPerValue[index]
            }))
            // drop answers without enough respondents on both sides
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

One-vs-rest expansion for single-answer questions: each option also becomes a
binary "picked it / picked something else" variable, so that findings like
"respondents who picked X rank lower on Y" (signed Spearman, i.e. rank-biserial
correlation) become visible.

Questions whose options have an order are expanded too, and still take part as
a whole scale as well. The scale correlation only detects monotonic trends, so
without expansion a pattern specific to one band — a middle salary bracket that
stands out while neither extreme does — cannot surface at all.

Operates on the already-encoded question to avoid re-reading the documents.

*/
// mirrors the bounds check used when grouping response buckets, so that a
// correlation's id always matches the bucket the chart renders
const isInGroup = (value: string, group: OptionGroup) => {
    const { items, lowerBound, upperBound } = group
    if (items) {
        return items.includes(value)
    }
    const hasLower = typeof lowerBound !== 'undefined'
    const hasUpper = typeof upperBound !== 'undefined'
    if (!hasLower && !hasUpper) {
        return false
    }
    const n = Number(value)
    if (Number.isNaN(n)) {
        return false
    }
    if (hasLower && hasUpper) {
        return n >= lowerBound! && n < upperBound!
    }
    return hasLower ? n >= lowerBound! : n < upperBound!
}

export const expandOptions = (
    encoded: EncodedQuestion,
    minSelections: number = MIN_OPTION_SELECTIONS
): EncodedQuestion[] => {
    const { question, codes, values } = encoded

    /*
    Questions that collect a raw value and group it for display (years of
    experience, age…) are expanded by group, not by value: "5 to 9 years" is
    both a meaningful variable and something the chart can attach an indicator
    to, whereas "exactly 7 years" is neither.
    */
    const groups = question.groups
    const variables = groups?.length
        ? groups.map(group => ({
              id: String(group.id),
              // the value indices that fall into this group
              members: new Set(
                  values.reduce<number[]>((indices, value, index) => {
                      if (isInGroup(value, group)) indices.push(index)
                      return indices
                  }, [])
              )
          }))
        : values.map((value, index) => ({ id: value, members: new Set([index]) }))

    return variables
        .map(({ id, members }) => {
            const binaryCodes = new Int16Array(codes.length)
            for (let i = 0; i < codes.length; i++) {
                const code = codes[i]
                binaryCodes[i] = code < 0 ? -1 : members.has(code) ? 1 : 0
            }
            return {
                question,
                optionId: id,
                isOrdinal: true,
                values: BINARY_VALUES,
                cardinality: 2,
                codes: binaryCodes
            }
        })
        .filter(binary => hasEnoughSelections(binary.codes, minSelections))
}

export interface PairStats {
    n: number
    correlation: number
}

/*

Compute the correlation between two variables from their contingency table
(rows × cols, row-major).

Spearman's rho is computed from the table using average (tie-corrected) ranks,
which is exact for tied data. It is only meaningful when both variables are
ordered, which is why only ordered variables are paired in the first place.

*/
export const computePairStats = (table: Int32Array, rows: number, cols: number): PairStats => {
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
    // a variable with fewer than two observed values cannot correlate
    const nonEmptyRows = rowSums.filter(s => s > 0).length
    const nonEmptyCols = colSums.filter(s => s > 0).length
    if (n === 0 || nonEmptyRows < 2 || nonEmptyCols < 2) {
        return { n, correlation: 0 }
    }

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
    const correlation =
        varianceX > 0 && varianceY > 0 ? covariance / Math.sqrt(varianceX * varianceY) : 0

    return { n, correlation }
}

export const round = (value: number) => Math.round(value * 10000) / 10000
