import {
    computePairStats,
    encodeMultiValueQuestion,
    encodeQuestion,
    expandCategoricalOptions,
    getCorrelationDirection,
    getCorrelationQuestions,
    getCorrelationStrength,
    putQuestionFirst,
    splitCorrelationItems
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

    test('returns null when cardinality exceeds the limit', () => {
        const question = makeQuestion({})
        const docs = makeDocs(Array.from({ length: 100 }, (_, i) => `value_${i}`))
        expect(encodeQuestion(question, docs)).toBeNull()
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
        expect(encoded.map(e => e.optionId)).toEqual(['zelda', 'mario', 'doom'])
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

    test('drops options never selected by anyone', () => {
        const question = makeQuestion({
            allowMultiple: true,
            options: [{ id: 'popular' }, { id: 'never_picked' }]
        })
        const docs = makeDocs([['popular'], ['popular'], ['some_unknown_game']])
        const encoded = encodeMultiValueQuestion(question, docs, 1)
        expect(encoded.map(e => e.optionId)).toEqual(['popular'])
    })

    test('returns nothing without options', () => {
        const question = makeQuestion({ allowMultiple: true })
        const docs = makeDocs([['a'], ['b']])
        expect(encodeMultiValueQuestion(question, docs, 1)).toEqual([])
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
        expect(encoded.map(e => e.optionId)).toEqual(['common'])
    })
})

describe('expandCategoricalOptions', () => {
    test('expands a categorical question into one-vs-rest binary variables', () => {
        const question = makeQuestion({
            options: [{ id: 'woman' }, { id: 'man' }, { id: 'non_binary' }]
        })
        const docs = makeDocs(['woman', 'man', 'non_binary', 'man', null])
        const encoded = encodeQuestion(question, docs)!
        const expanded = expandCategoricalOptions(encoded, 1)
        expect(expanded.map(e => e.optionId)).toEqual(['woman', 'man', 'non_binary'])
        const byOption = Object.fromEntries(expanded.map(e => [e.optionId, Array.from(e.codes)]))
        expect(byOption.woman).toEqual([1, 0, 0, 0, -1])
        expect(byOption.man).toEqual([0, 1, 0, 1, -1])
        expect(byOption.non_binary).toEqual([0, 0, 1, 0, -1])
        // binary variables are ordinal so pairs with them get a signed spearman
        expect(expanded.every(e => e.isOrdinal && e.cardinality === 2)).toBe(true)
    })

    test('does not expand ordinal questions', () => {
        const question = makeQuestion({
            options: [{ id: 'low' }, { id: 'high' }],
            optionsAreSequential: true
        })
        const encoded = encodeQuestion(question, makeDocs(['low', 'high']))!
        expect(expandCategoricalOptions(encoded, 1)).toEqual([])
    })

    test('drops options below the minimum selections threshold', () => {
        const question = makeQuestion({
            options: [{ id: 'a' }, { id: 'b' }, { id: 'c' }]
        })
        // 'c' is only picked once, below the threshold of 2
        const docs = makeDocs(['a', 'a', 'b', 'b', 'c'])
        const encoded = encodeQuestion(question, docs)!
        const expanded = expandCategoricalOptions(encoded, 2)
        expect(expanded.map(e => e.optionId)).toEqual(['a', 'b'])
    })
})

describe('splitCorrelationItems', () => {
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
        const { questionCorrelations, answerCorrelations } = splitCorrelationItems(items)
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
        const { questionCorrelations, answerCorrelations } = splitCorrelationItems(items, 1)
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
    test('question correlation bands', () => {
        expect(getCorrelationStrength(0.5, false)).toBe('very_strong')
        expect(getCorrelationStrength(-0.5, false)).toBe('very_strong')
        expect(getCorrelationStrength(0.49, false)).toBe('strong')
        expect(getCorrelationStrength(0.3, false)).toBe('strong')
        expect(getCorrelationStrength(0.29, false)).toBe('moderate')
        expect(getCorrelationStrength(0.15, false)).toBe('moderate')
        expect(getCorrelationStrength(0.14, false)).toBe('weak')
    })

    test('answer correlation bands use lower thresholds', () => {
        expect(getCorrelationStrength(0.4, true)).toBe('very_strong')
        expect(getCorrelationStrength(-0.39, true)).toBe('strong')
        expect(getCorrelationStrength(0.25, true)).toBe('strong')
        expect(getCorrelationStrength(0.24, true)).toBe('moderate')
        expect(getCorrelationStrength(0.1, true)).toBe('moderate')
        expect(getCorrelationStrength(0.09, true)).toBe('weak')
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
