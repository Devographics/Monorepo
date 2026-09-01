import { buildCardinalities } from './question_cardinalities'

describe('buildCardinalities', () => {
    test('empty input yields an empty distribution', () => {
        expect(buildCardinalities([])).toEqual({ n: 0, mean: 0, max: 0, buckets: [] })
    })

    test('single bucket', () => {
        const result = buildCardinalities([{ _id: 1, count: 40 }])
        expect(result.n).toBe(40)
        expect(result.mean).toBe(1)
        expect(result.max).toBe(1)
        expect(result.buckets).toEqual([{ answerCount: 1, count: 40, percentage: 100 }])
    })

    test('spread distribution: n, mean, max and percentages', () => {
        // 50 picked 1, 30 picked 2, 20 picked 3
        const result = buildCardinalities([
            { _id: 1, count: 50 },
            { _id: 2, count: 30 },
            { _id: 3, count: 20 }
        ])
        expect(result.n).toBe(100)
        // (50*1 + 30*2 + 20*3) / 100 = 1.7
        expect(result.mean).toBe(1.7)
        expect(result.max).toBe(3)
        expect(result.buckets).toEqual([
            { answerCount: 1, count: 50, percentage: 50 },
            { answerCount: 2, count: 30, percentage: 30 },
            { answerCount: 3, count: 20, percentage: 20 }
        ])
    })

    test('percentages are rounded, not forced to sum to 100', () => {
        const result = buildCardinalities([
            { _id: 1, count: 1 },
            { _id: 2, count: 1 },
            { _id: 5, count: 1 }
        ])
        expect(result.n).toBe(3)
        expect(result.max).toBe(5)
        // 1/3 -> 33.3333 at 4-decimal rounding
        expect(result.buckets[0].percentage).toBeCloseTo(33.3333, 3)
    })
})
