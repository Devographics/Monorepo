import {
    computePairStats,
    encodeMultiValueQuestion,
    encodeQuestion,
    expandOptions,
    filterCorrelations,
    getCorrelationDirection,
    getCorrelationQuestions,
    getCorrelationStrength,
    isBlockedPair,
    isNonAnswerPair,
    isNormalizationArtifact,
    putQuestionFirst,
    splitEditionCorrelations,
    splitQuestionCorrelations
} from './correlations_calculations'
import type { CorrelationItem } from './correlations_calculations'
import type { EditionApiObject, QuestionApiObject } from '../types/surveys'

describe('computePairStats', () => {
    test('perfect positive association', () => {
        // prettier-ignore
        const table = new Int32Array([
            50, 0,
            0, 50
        ])
        const { n, correlation } = computePairStats(table, 2, 2)
        expect(n).toBe(100)
        expect(correlation).toBeCloseTo(1, 5)
    })

    test('perfect negative association', () => {
        // prettier-ignore
        const table = new Int32Array([
            0, 50,
            50, 0
        ])
        const { correlation } = computePairStats(table, 2, 2)
        expect(correlation).toBeCloseTo(-1, 5)
    })

    test('independence yields zero correlation', () => {
        // prettier-ignore
        const table = new Int32Array([
            25, 25,
            25, 25
        ])
        const { correlation } = computePairStats(table, 2, 2)
        expect(correlation).toBe(0)
    })

    test('known 2x2 table value', () => {
        // prettier-ignore
        const table = new Int32Array([
            30, 10,
            10, 30
        ])
        const { correlation } = computePairStats(table, 2, 2)
        expect(correlation).toBeCloseTo(0.5, 5)
    })

    test('empty categories are ignored', () => {
        // middle row never chosen: behaves like the 2x2 case above
        // prettier-ignore
        const table = new Int32Array([
            30, 10,
            0, 0,
            10, 30
        ])
        const { correlation } = computePairStats(table, 3, 2)
        expect(correlation).toBeCloseTo(0.5, 5)
    })

    test('degenerate table (single observed category) yields zero', () => {
        // prettier-ignore
        const table = new Int32Array([
            40, 60,
            0, 0
        ])
        const { n, correlation } = computePairStats(table, 2, 2)
        expect(n).toBe(100)
        expect(correlation).toBe(0)
    })
})

const makeQuestion = (fields: any): QuestionApiObject =>
    ({
        id: 'q1',
        surveyId: 'test_survey',
        normPaths: { response: 'section.q1.choices' },
        ...fields
    } as QuestionApiObject)

const makeDocs = (values: any[]) =>
    values.map(value => ({ section: { q1: { choices: value } } }))

describe('encodeQuestion', () => {
    test('encodes option values by option order and skips invalid values', () => {
        const question = makeQuestion({
            options: [{ id: 'low' }, { id: 'medium' }, { id: 'high' }],
            optionsAreSequential: true
        })
        const docs = makeDocs([
            'low',
            'medium',
            'high',
            'no_answer',
            null,
            'not_an_option',
            ['medium'], // single-element arrays unwrap
            ['low', 'high'] // multi-element arrays are treated as unanswered
        ])
        const encoded = encodeQuestion(question, docs)
        expect(encoded).not.toBeNull()
        expect(Array.from(encoded!.codes)).toEqual([0, 1, 2, -1, -1, -1, 1, -1])
        expect(encoded!.cardinality).toBe(3)
        expect(encoded!.isOrdinal).toBe(true)
    })

    test('numeric values match numeric option ids', () => {
        const question = makeQuestion({
            options: [{ id: 1 }, { id: 2 }, { id: 3 }],
            optionsAreNumeric: true
        })
        const docs = makeDocs([1, '2', 3])
        const encoded = encodeQuestion(question, docs)
        expect(Array.from(encoded!.codes)).toEqual([0, 1, 2])
    })

    test('builds value map from data when question has no options', () => {
        const question = makeQuestion({})
        const docs = makeDocs(['a', 'b', 'a', 'c'])
        const encoded = encodeQuestion(question, docs)
        expect(Array.from(encoded!.codes)).toEqual([0, 1, 0, 2])
        expect(encoded!.cardinality).toBe(3)
        expect(encoded!.isOrdinal).toBe(false)
    })

    test('returns null when a single value is observed', () => {
        const question = makeQuestion({
            options: [{ id: 'yes' }, { id: 'no' }]
        })
        const docs = makeDocs(['yes', 'yes', 'yes'])
        expect(encodeQuestion(question, docs)).toBeNull()
    })

    test('a numeric question with no options is ordinal, ordered by value', () => {
        // the `years` template supplies display groups, not options, so the
        // order has to come from the answers themselves
        const question = makeQuestion({ optionsAreNumeric: true })
        const docs = makeDocs([10, 2, 2, 30, 0.5, 10, 2])
        const encoded = encodeQuestion(question, docs)!
        expect(encoded.isOrdinal).toBe(true)
        // numeric order, not frequency order (2 is the most common answer)
        expect(encoded.values).toEqual(['0.5', '2', '10', '30'])
        // ...so the codes are ranks
        expect(Array.from(encoded.codes)).toEqual([2, 1, 1, 3, 0, 2, 1])
    })

    test('a non-numeric question with no options stays unordered', () => {
        const question = makeQuestion({})
        const docs = makeDocs(['b', 'a', 'a'])
        const encoded = encodeQuestion(question, docs)!
        expect(encoded.isOrdinal).toBe(false)
        // frequency order
        expect(encoded.values).toEqual(['a', 'b'])
    })

    test('keeps the most common values when there are more than the cap', () => {
        const question = makeQuestion({})
        // 40 distinct values; the first three are answered more than once
        const docs = makeDocs([
            ...Array.from({ length: 40 }, (_, i) => `value_${i}`),
            'value_0',
            'value_0',
            'value_1',
            'value_2'
        ])
        const encoded = encodeQuestion(question, docs, 3)!
        expect(encoded.values).toEqual(['value_0', 'value_1', 'value_2'])
        expect(encoded.cardinality).toBe(3)
        // values outside the kept set are treated as unanswered
        expect(Array.from(encoded.codes.slice(0, 4))).toEqual([0, 1, 2, -1])
    })

    test('an ordinal question is dropped rather than truncated, to preserve ranks', () => {
        const question = makeQuestion({
            optionsAreSequential: true,
            options: Array.from({ length: 5 }, (_, i) => ({ id: `band_${i}` }))
        })
        const docs = makeDocs(['band_0', 'band_1', 'band_2'])
        expect(encodeQuestion(question, docs, 3)).toBeNull()
    })
})

describe('encodeMultiValueQuestion', () => {
    test('expands options into binary selected/not-selected variables', () => {
        const question = makeQuestion({
            allowMultiple: true,
            options: [{ id: 'zelda' }, { id: 'mario' }, { id: 'doom' }]
        })
        const docs = makeDocs([
            ['zelda', 'doom'],
            ['mario'],
            null, // did not answer
            ['zelda', 'unknown_game'] // unknown values still count as answering
        ])
        const encoded = encodeMultiValueQuestion(question, docs, 1)
        // answers come from the data, most common first — so an "other…" answer
        // like unknown_game takes part alongside the predefined ones
        expect(encoded.map(e => e.optionId)).toEqual([
            'zelda',
            'doom',
            'mario',
            'unknown_game'
        ])
        const byOption = Object.fromEntries(encoded.map(e => [e.optionId, Array.from(e.codes)]))
        expect(byOption.zelda).toEqual([1, 0, -1, 1])
        expect(byOption.mario).toEqual([0, 1, -1, 0])
        expect(byOption.doom).toEqual([1, 0, -1, 0])
        expect(encoded.every(e => e.isOrdinal && e.cardinality === 2)).toBe(true)
    })

    test('reads values from all normalized paths (response + other)', () => {
        const question = makeQuestion({
            allowMultiple: true,
            normPaths: { response: 'section.q1.choices', other: 'section.q1.others.normalized' },
            options: [{ id: 'predefined' }, { id: 'freeform' }]
        })
        const docs = [
            { section: { q1: { choices: ['predefined'], others: { normalized: ['freeform'] } } } },
            { section: { q1: { choices: ['predefined'] } } },
            { section: { q1: { others: { normalized: ['freeform'] } } } }
        ]
        const encoded = encodeMultiValueQuestion(question, docs, 1)
        const byOption = Object.fromEntries(encoded.map(e => [e.optionId, Array.from(e.codes)]))
        expect(byOption.predefined).toEqual([1, 1, 0])
        expect(byOption.freeform).toEqual([1, 0, 1])
    })

    test('ignores declared options nobody selected', () => {
        const question = makeQuestion({
            allowMultiple: true,
            options: [{ id: 'popular' }, { id: 'never_picked' }]
        })
        const docs = makeDocs([['popular'], ['popular'], ['some_unknown_game']])
        const encoded = encodeMultiValueQuestion(question, docs, 1)
        const ids = encoded.map(e => e.optionId)
        expect(ids).not.toContain('never_picked')
        expect(ids).toContain('popular')
    })

    test('works with no declared options at all', () => {
        const question = makeQuestion({ allowMultiple: true })
        const docs = makeDocs([['a'], ['b']])
        expect(encodeMultiValueQuestion(question, docs, 1).map(e => e.optionId)).toEqual([
            'a',
            'b'
        ])
    })

    test('returns nothing when the question has no normalized paths', () => {
        const question = makeQuestion({ allowMultiple: true, normPaths: {} })
        expect(encodeMultiValueQuestion(question, makeDocs([['a'], ['b']]), 1)).toEqual([])
    })

    test('drops options below the minimum selections threshold', () => {
        const question = makeQuestion({
            allowMultiple: true,
            options: [{ id: 'common' }, { id: 'rare' }]
        })
        const docs = makeDocs([
            ...Array.from({ length: 5 }, () => ['common']),
            ...Array.from({ length: 5 }, () => ['rare', 'common']),
            ...Array.from({ length: 6 }, () => ['unknown'])
        ])
        // 'rare' only has 5 selections, below the threshold of 6
        // ('common' has 10 selections and 6 non-selections, so it stays)
        const encoded = encodeMultiValueQuestion(question, docs, 6)
        const ids = encoded.map(e => e.optionId)
        expect(ids).not.toContain('rare')
        expect(ids).toContain('common')
    })
})

describe('expandOptions with groups', () => {
    const question = () =>
        makeQuestion({
            optionsAreNumeric: true,
            groups: [
                { id: 'range_0_4', lowerBound: 0, upperBound: 5 },
                { id: 'range_5_9', lowerBound: 5, upperBound: 10 },
                { id: 'range_over_10', lowerBound: 10 }
            ]
        })

    test('expands by group so ids match the chart buckets', () => {
        const docs = makeDocs([2, 7, 30, 4, null])
        const encoded = encodeQuestion(question(), docs)!
        const expanded = expandOptions(encoded, 1)
        expect(expanded.map(e => e.optionId)).toEqual([
            'range_0_4',
            'range_5_9',
            'range_over_10'
        ])
        const byId = Object.fromEntries(expanded.map(e => [e.optionId, Array.from(e.codes)]))
        // bounds are inclusive-lower, exclusive-upper: 4 lands in range_0_4
        expect(byId.range_0_4).toEqual([1, 0, 0, 1, -1])
        expect(byId.range_5_9).toEqual([0, 1, 0, 0, -1])
        expect(byId.range_over_10).toEqual([0, 0, 1, 0, -1])
    })

    test('the whole question stays an ungrouped ordinal scale', () => {
        const encoded = encodeQuestion(question(), makeDocs([2, 7, 30]))!
        // raw values give finer ranks for the trend than the groups would
        expect(encoded.isOrdinal).toBe(true)
        expect(encoded.values).toEqual(['2', '7', '30'])
    })
})

describe('expandOptions', () => {
    test('expands a categorical question into one-vs-rest binary variables', () => {
        const question = makeQuestion({
            options: [{ id: 'woman' }, { id: 'man' }, { id: 'non_binary' }]
        })
        const docs = makeDocs(['woman', 'man', 'non_binary', 'man', null])
        const encoded = encodeQuestion(question, docs)!
        const expanded = expandOptions(encoded, 1)
        // non-ordinal values are indexed by frequency, so "man" (answered twice)
        // comes first regardless of the declared option order
        expect(expanded.map(e => e.optionId)).toEqual(['man', 'woman', 'non_binary'])
        const byOption = Object.fromEntries(expanded.map(e => [e.optionId, Array.from(e.codes)]))
        expect(byOption.woman).toEqual([1, 0, 0, 0, -1])
        expect(byOption.man).toEqual([0, 1, 0, 1, -1])
        expect(byOption.non_binary).toEqual([0, 0, 1, 0, -1])
        // binary variables are ordinal so pairs with them get a signed spearman
        expect(expanded.every(e => e.isOrdinal && e.cardinality === 2)).toBe(true)
    })

    test('expands ordinal questions too, so band-specific patterns can surface', () => {
        const question = makeQuestion({
            options: [{ id: 'low' }, { id: 'mid' }, { id: 'high' }],
            optionsAreSequential: true
        })
        const encoded = encodeQuestion(question, makeDocs(['low', 'mid', 'high', 'mid']))!
        const expanded = expandOptions(encoded, 1)
        expect(expanded.map(e => e.optionId)).toEqual(['low', 'mid', 'high'])
        // the middle band is the case a monotonic scale correlation cannot see
        const mid = expanded.find(e => e.optionId === 'mid')!
        expect(Array.from(mid.codes)).toEqual([0, 1, 0, 1])
    })

    test('drops options below the minimum selections threshold', () => {
        const question = makeQuestion({
            options: [{ id: 'a' }, { id: 'b' }, { id: 'c' }]
        })
        // 'c' is only picked once, below the threshold of 2
        const docs = makeDocs(['a', 'a', 'b', 'b', 'c'])
        const encoded = encodeQuestion(question, docs)!
        const expanded = expandOptions(encoded, 2)
        expect(expanded.map(e => e.optionId)).toEqual(['a', 'b'])
    })
})

describe('filterCorrelations', () => {
    const item = (strength: string, correlation = 0.5) =>
        ({ strength, correlation } as CorrelationItem)

    test('keeps moderate and stronger by default', () => {
        const items = [
            item('very_strong'),
            item('weak'),
            item('strong'),
            item('moderate'),
            item('weak')
        ]
        expect(filterCorrelations(items).map(i => i.strength)).toEqual([
            'very_strong',
            'strong',
            'moderate'
        ])
    })

    test('honours a custom minimum strength', () => {
        const items = [item('very_strong'), item('strong'), item('moderate'), item('weak')]
        expect(filterCorrelations(items, { minStrength: 'strong' }).map(i => i.strength)).toEqual([
            'very_strong',
            'strong'
        ])
        expect(filterCorrelations(items, { minStrength: 'weak' })).toHaveLength(4)
    })

    test('applies the limit after filtering', () => {
        const items = [item('strong'), item('weak'), item('strong'), item('strong')]
        // the weak item must not consume one of the two slots
        const filtered = filterCorrelations(items, { limit: 2 })
        expect(filtered).toHaveLength(2)
        expect(filtered.every(i => i.strength === 'strong')).toBe(true)
    })

    test('returns nothing when everything is too weak', () => {
        expect(filterCorrelations([item('weak'), item('weak')])).toEqual([])
    })
})

describe('splitQuestionCorrelations', () => {
    const item = (fields: Partial<CorrelationItem>): CorrelationItem =>
        ({
            questionId1: 'gender',
            questionId2: 'other',
            n: 1000,
            sameSection: false,
            correlation: 0.5,
            strength: 'strong',
            direction: 'positive',
            ...fields
        } as CorrelationItem)

    test('groups items by the queried question own answers, in option order', () => {
        const question = makeQuestion({
            id: 'gender',
            options: [{ id: 'male' }, { id: 'female' }, { id: 'non_binary' }]
        })
        // deliberately not in option order, to check groups get reordered
        const items = [
            item({ optionId1: 'female', correlation: 0.9 }),
            item({ optionId1: 'male', correlation: 0.8 }),
            item({ optionId1: 'female', correlation: 0.7 })
        ]
        const { questionCorrelations, optionCorrelations } = splitQuestionCorrelations(
            items,
            question
        )
        expect(questionCorrelations).toEqual([])
        expect(optionCorrelations.map(g => g.id)).toEqual(['male', 'female'])
        // within a group, incoming (strongest-first) order is preserved
        expect(optionCorrelations[1].correlations.map(i => i.correlation)).toEqual([0.9, 0.7])
        // options with no correlations produce no group at all
        expect(optionCorrelations.some(g => g.id === 'non_binary')).toBe(false)
    })

    test('items without an own answer describe the question as a whole', () => {
        const question = makeQuestion({ id: 'yearly_salary', options: [{ id: 'range_1' }] })
        const items = [
            // other side is a whole question
            item({ questionId1: 'yearly_salary', questionId2: 'company_size' }),
            // other side is another question's answer: still question-level here
            item({
                questionId1: 'yearly_salary',
                questionId2: 'workplace_perks',
                optionId2: 'compensation'
            })
        ]
        const { questionCorrelations, optionCorrelations } = splitQuestionCorrelations(
            items,
            question
        )
        expect(questionCorrelations).toHaveLength(2)
        expect(optionCorrelations).toEqual([])
    })

    test('drops weak correlations, and options left with none', () => {
        const question = makeQuestion({
            id: 'gender',
            options: [{ id: 'male' }, { id: 'female' }]
        })
        const items = [
            item({ optionId1: 'male', strength: 'strong' }),
            item({ optionId1: 'male', strength: 'weak' }),
            item({ optionId1: 'female', strength: 'weak' })
        ]
        const { optionCorrelations } = splitQuestionCorrelations(items, question)
        // female had only a weak correlation, so it gets no group at all
        expect(optionCorrelations.map(g => g.id)).toEqual(['male'])
        expect(optionCorrelations[0].correlations).toHaveLength(1)
    })

    test('caps each option group independently', () => {
        const question = makeQuestion({
            id: 'gender',
            options: [{ id: 'male' }, { id: 'female' }]
        })
        const items = [
            ...Array.from({ length: 8 }, () => item({ optionId1: 'male' })),
            ...Array.from({ length: 8 }, () => item({ optionId1: 'female' }))
        ]
        const { optionCorrelations } = splitQuestionCorrelations(items, question)
        // both groups are capped at OPTION_CORRELATIONS_LIMIT rather than
        // competing for a single shared budget
        expect(optionCorrelations.map(g => g.correlations.length)).toEqual([5, 5])
    })
})

describe('splitEditionCorrelations', () => {
    const makeItem = (fields: Partial<CorrelationItem>): CorrelationItem =>
        ({
            questionId1: 'a',
            questionId2: 'b',
            n: 1000,
            sameSection: false,
            correlation: 0.5,
            ...fields
        } as CorrelationItem)

    test('splits into question and answer correlations, preserving order', () => {
        const items = [
            makeItem({ correlation: 0.9, optionId1: 'x' }),
            makeItem({ correlation: 0.8 }),
            makeItem({ correlation: -0.7, optionId2: 'y' }),
            makeItem({ correlation: 0.6 })
        ]
        const { questionCorrelations, answerCorrelations } = splitEditionCorrelations(items)
        expect(questionCorrelations.map(i => i.correlation)).toEqual([0.8, 0.6])
        expect(answerCorrelations.map(i => i.correlation)).toEqual([0.9, -0.7])
    })

    test('applies the limit to each list separately', () => {
        const items = [
            makeItem({ optionId1: 'x' }),
            makeItem({ optionId1: 'y' }),
            makeItem({}),
            makeItem({})
        ]
        const { questionCorrelations, answerCorrelations } = splitEditionCorrelations(items, 1)
        expect(questionCorrelations).toHaveLength(1)
        expect(answerCorrelations).toHaveLength(1)
    })
})

describe('putQuestionFirst', () => {
    const item = {
        questionId1: 'yearly_salary',
        sectionId1: 'workplace',
        questionId2: 'gender',
        sectionId2: 'user_info',
        optionId2: 'female',
        n: 4000,
        correlation: -0.04,
        strength: 'weak',
        direction: 'negative',
        sameSection: false
    } as CorrelationItem

    test('swaps sides when the question is second', () => {
        const swapped = putQuestionFirst(item, 'gender')
        expect(swapped.questionId1).toBe('gender')
        expect(swapped.optionId1).toBe('female')
        expect(swapped.sectionId1).toBe('user_info')
        expect(swapped.questionId2).toBe('yearly_salary')
        expect(swapped.optionId2).toBeUndefined()
        // rank correlation is symmetric: value untouched
        expect(swapped.correlation).toBe(-0.04)
    })

    test('leaves items alone when the question is already first', () => {
        expect(putQuestionFirst(item, 'yearly_salary')).toBe(item)
    })
})

describe('getCorrelationStrength', () => {
    test('one scale is used for every kind of correlation', () => {
        expect(getCorrelationStrength(0.4)).toBe('very_strong')
        expect(getCorrelationStrength(-0.4)).toBe('very_strong')
        expect(getCorrelationStrength(0.39)).toBe('strong')
        expect(getCorrelationStrength(0.25)).toBe('strong')
        expect(getCorrelationStrength(-0.25)).toBe('strong')
        expect(getCorrelationStrength(0.24)).toBe('moderate')
        expect(getCorrelationStrength(0.1)).toBe('moderate')
        expect(getCorrelationStrength(0.09)).toBe('weak')
    })

    test('a larger correlation is never labelled weaker than a smaller one', () => {
        // the two-table scale used to label 0.27 "moderate" and 0.25 "strong",
        // which read as an inversion wherever both appeared in one list
        expect(getCorrelationStrength(0.27)).toBe('strong')
        expect(getCorrelationStrength(-0.25)).toBe('strong')
    })
})

describe('isBlockedPair', () => {
    const q = (id: string, doNotCorrelateWith?: string[]) =>
        ({ id, doNotCorrelateWith } as QuestionApiObject)

    test('blocks the pair in both directions from a single declaration', () => {
        const race = q('race_ethnicity', ['country', 'country_of_origin'])
        const country = q('country')
        expect(isBlockedPair(race, country)).toBe(true)
        // symmetric: the field is only declared on race_ethnicity
        expect(isBlockedPair(country, race)).toBe(true)
    })

    test('leaves other pairs alone', () => {
        const race = q('race_ethnicity', ['country'])
        expect(isBlockedPair(race, q('yearly_salary'))).toBe(false)
        expect(isBlockedPair(q('gender'), q('yearly_salary'))).toBe(false)
    })
})

describe('isNormalizationArtifact', () => {
    test('no_match never becomes a variable', () => {
        expect(isNormalizationArtifact('no_match')).toBe(true)
        expect(isNormalizationArtifact('na')).toBe(false)
        expect(isNormalizationArtifact('padel')).toBe(false)
    })

    test('an unmatched free-form answer is dropped from a multi-value question', () => {
        const question = makeQuestion({ allowMultiple: true })
        const docs = makeDocs([
            ['padel', 'no_match'],
            ['no_match'],
            ['padel'],
            ['running']
        ])
        const encoded = encodeMultiValueQuestion(question, docs, 1)
        expect(encoded.map(e => e.optionId)).not.toContain('no_match')
        expect(encoded.map(e => e.optionId)).toEqual(['padel', 'running'])
        // the respondent whose only answer was unmatched still counts as having
        // answered, so they are a 0 rather than being dropped from the question
        const padel = encoded.find(e => e.optionId === 'padel')!
        expect(Array.from(padel.codes)).toEqual([1, 0, 1, 0])
    })
})

describe('isNonAnswerPair', () => {
    test('only drops a pair when both sides are non-answers', () => {
        expect(isNonAnswerPair('na', 'na')).toBe(true)
        // a single non-answer against a real answer can still be informative
        expect(isNonAnswerPair('na', 'female')).toBe(false)
        expect(isNonAnswerPair('female', 'na')).toBe(false)
        // whole-question sides have no option id at all
        expect(isNonAnswerPair('na', undefined)).toBe(false)
        expect(isNonAnswerPair(undefined, undefined)).toBe(false)
    })
})

describe('getCorrelationDirection', () => {
    test('sign maps to direction', () => {
        expect(getCorrelationDirection(0.3)).toBe('positive')
        expect(getCorrelationDirection(-0.3)).toBe('negative')
    })
})

describe('getCorrelationQuestions', () => {
    test('applies the meta-question exclusion list', () => {
        const edition = { id: 'devs2026' } as EditionApiObject
        const questionObjects = [
            makeQuestion({ id: 'yearly_salary', editions: ['devs2026'] }),
            makeQuestion({ id: 'skipped', editions: ['devs2026'] }),
            makeQuestion({ id: 'how_can_we_improve', editions: ['devs2026'] })
        ]
        const questions = getCorrelationQuestions({ questionObjects, edition })
        expect(questions.map(q => q.id)).toEqual(['yearly_salary'])
    })
})
