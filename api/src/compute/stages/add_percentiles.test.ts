import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { BucketUnits } from '@devographics/types'
import { CUTOFF_ANSWERS, NO_ANSWER, NOT_APPLICABLE, OVERALL } from '@devographics/constants'
import {
    addPercentiles,
    calculatePercentiles2,
    percentileSteps,
    zeroPercentiles
} from './add_percentiles'
import type { ComputeAxisParameters } from '../../types'

const axis = (question: any, options?: any[]) =>
    ({ question, options } as unknown as ComputeAxisParameters)

// salary-like range question
const rangeAxis = axis({ id: 'salary', optionsAreRange: true }, [
    { id: 'low', average: 10 },
    { id: 'mid', average: 20 },
    { id: 'high', average: 30 }
])

// slider: option ids are numbers, each one standing in for a `value`
const sliderAxis = axis(
    { id: 'slider', optionsAreNumeric: true },
    [0, 12.5, 25, 37.5, 50, 62.5, 75, 87.5, 100].map((value, id) => ({ id, value }))
)

const otherAxis = axis({ id: 'browser' }, [{ id: 'chrome' }])

const percentilesOf = (buckets: any[], axis_: ComputeAxisParameters) =>
    calculatePercentiles2({ buckets, axis: axis_ })

describe('percentileSteps', () => {
    test('lists the percentiles that are calculated', () => {
        expect(percentileSteps).toEqual([0, 10, 25, 50, 75, 90, 100])
        expect(Object.keys(zeroPercentiles)).toEqual(percentileSteps.map(p => `p${p}`))
    })
})

describe('calculatePercentiles2', () => {
    test('expands buckets into datapoints and interpolates linearly between them', () => {
        // datapoints: [10, 20, 30]
        const result = percentilesOf(
            [
                { id: 'low', count: 1 },
                { id: 'mid', count: 1 },
                { id: 'high', count: 1 }
            ],
            rangeAxis
        )
        expect(result.p0).toBe(10)
        expect(result.p10).toBeCloseTo(12)
        expect(result.p25).toBeCloseTo(15)
        expect(result.p50).toBe(20)
        expect(result.p75).toBeCloseTo(25)
        expect(result.p90).toBeCloseTo(28)
        expect(result.p100).toBe(30)
    })

    test('weights each bucket by its count', () => {
        // datapoints: [10, 10, 10, 30]
        const result = percentilesOf(
            [
                { id: 'low', count: 3 },
                { id: 'high', count: 1 }
            ],
            rangeAxis
        )
        expect(result.p0).toBe(10)
        expect(result.p50).toBe(10)
        expect(result.p75).toBeCloseTo(15)
        expect(result.p100).toBe(30)
    })

    test('does not depend on the order of the buckets', () => {
        const buckets = [
            { id: 'low', count: 3 },
            { id: 'mid', count: 2 },
            { id: 'high', count: 1 }
        ]
        expect(percentilesOf([...buckets].reverse(), rangeAxis)).toEqual(
            percentilesOf(buckets, rangeAxis)
        )
    })

    test('a single datapoint gives the same value for every percentile', () => {
        const result = percentilesOf([{ id: 'mid', count: 1 }], rangeAxis)
        expect(Object.values(result)).toEqual([20, 20, 20, 20, 20, 20, 20])
    })

    test('a single bucket gives the same value for every percentile', () => {
        const result = percentilesOf([{ id: 'mid', count: 50 }], rangeAxis)
        expect(Object.values(result)).toEqual([20, 20, 20, 20, 20, 20, 20])
    })

    test('excludes no_answer, na and cutoff_answers buckets', () => {
        const result = percentilesOf(
            [
                { id: 'low', count: 1 },
                { id: 'high', count: 1 },
                { id: NO_ANSWER, count: 100 },
                { id: NOT_APPLICABLE, count: 100 },
                { id: CUTOFF_ANSWERS, count: 100 }
            ],
            rangeAxis
        )
        expect(result.p0).toBe(10)
        expect(result.p50).toBe(20)
        expect(result.p100).toBe(30)
    })

    test('buckets with a count of 0 add no datapoints', () => {
        const result = percentilesOf(
            [
                { id: 'low', count: 0 },
                { id: 'mid', count: 2 }
            ],
            rangeAxis
        )
        expect(result.p0).toBe(20)
        expect(result.p100).toBe(20)
    })

    test('gives 0 for every percentile when there are no datapoints', () => {
        // e.g. every facet was zeroed out by the privacy cutoff
        expect(percentilesOf([], rangeAxis)).toEqual(zeroPercentiles)
        expect(percentilesOf([{ id: 'low', count: 0 }], rangeAxis)).toEqual(zeroPercentiles)
        expect(percentilesOf([{ id: NO_ANSWER, count: 5 }], rangeAxis)).toEqual(zeroPercentiles)
    })

    test('a bucket made of grouped buckets is replaced by the grouped buckets', () => {
        // the group itself has no matching option (and a bogus count); its children are used
        const group = {
            id: 'range_low_high',
            count: 999,
            groupedBuckets: [
                { id: 'low', count: 1 },
                { id: 'high', count: 1 }
            ]
        }
        const result = percentilesOf([group], rangeAxis)
        expect(result.p0).toBe(10)
        expect(result.p50).toBe(20)
        expect(result.p100).toBe(30)
    })

    test('grouped buckets are filtered like any other bucket', () => {
        const group = {
            id: 'group',
            groupedBuckets: [
                { id: 'mid', count: 2 },
                { id: NO_ANSWER, count: 100 }
            ]
        }
        const result = percentilesOf([group], rangeAxis)
        expect(result.p0).toBe(20)
        expect(result.p100).toBe(20)
    })

    /*

    Regression test: merged facet buckets have string ids ("4") while the slider's
    option ids are numbers (4); percentiles must use the option `value` (0 to 100),
    not the raw id (0 to 8).

    */
    test('uses slider option values when bucket ids are strings', () => {
        const buckets = [...Array(9)].map((_, i) => ({ id: String(i), count: 1 }))
        const result = percentilesOf(buckets, sliderAxis)
        expect(result.p0).toBe(0)
        expect(result.p50).toBe(50)
        expect(result.p100).toBe(100)
    })

    test('uses slider option values when bucket ids are numbers', () => {
        const buckets = [...Array(9)].map((_, i) => ({ id: i, count: 1 }))
        const result = percentilesOf(buckets, sliderAxis)
        expect(result.p0).toBe(0)
        expect(result.p50).toBe(50)
        expect(result.p100).toBe(100)
    })

    test('does not modify the buckets it is given', () => {
        const buckets = [
            { id: 'low', count: 1 },
            { id: 'high', count: 1 }
        ]
        percentilesOf(buckets, rangeAxis)
        expect(buckets).toEqual([
            { id: 'low', count: 1 },
            { id: 'high', count: 1 }
        ])
    })

    describe('when the average of a bucket cannot be found', () => {
        beforeEach(() => {
            // getBucketAverage logs the bucket and axis before throwing
            vi.spyOn(console, 'log').mockImplementation(() => {})
        })
        afterEach(() => {
            vi.restoreAllMocks()
        })

        test('throws', () => {
            expect(() => percentilesOf([{ id: 'unknown', count: 1 }], rangeAxis)).toThrow(
                /could not find option average for bucket "unknown"/
            )
        })
    })
})

describe('addPercentiles', () => {
    const PERCENTILES = BucketUnits.PERCENTILES
    const MEDIAN = BucketUnits.MEDIAN
    const editionData = (buckets: any[]) => ({ editionId: 'e1', buckets } as any)

    describe('edition percentiles (axis1 is a range or numeric question)', () => {
        test('are calculated from the top-level buckets, and the median is p50', async () => {
            const results = [
                editionData([
                    { id: 'low', count: 1 },
                    { id: 'mid', count: 1 },
                    { id: 'high', count: 1 }
                ])
            ]
            await addPercentiles(results, rangeAxis, otherAxis)
            expect(results[0].percentiles).toEqual(
                percentilesOf(
                    [
                        { id: 'low', count: 1 },
                        { id: 'mid', count: 1 },
                        { id: 'high', count: 1 }
                    ],
                    rangeAxis
                )
            )
            expect(results[0].percentiles.p50).toBe(20)
            expect(results[0].median).toBe(20)
        })

        test('ignore the overall bucket', async () => {
            const results = [
                editionData([
                    { id: 'low', count: 1 },
                    { id: OVERALL, count: 1000, facetBuckets: [] }
                ])
            ]
            await addPercentiles(results, rangeAxis, otherAxis)
            expect(results[0].percentiles.p100).toBe(10)
            expect(results[0].median).toBe(10)
        })

        test('work with numeric questions', async () => {
            const numericAxis = axis({ id: 'hours', optionsAreNumeric: true })
            const results = [
                editionData([
                    { id: '10', count: 1 },
                    { id: '20', count: 1 },
                    { id: '30', count: 1 }
                ])
            ]
            await addPercentiles(results, numericAxis, otherAxis)
            expect(results[0].median).toBe(20)
        })

        test('are not set for other questions', async () => {
            const results = [editionData([{ id: 'chrome', count: 1 }])]
            await addPercentiles(results, otherAxis, otherAxis)
            expect(results[0].percentiles).toBeUndefined()
            expect(results[0].median).toBeUndefined()
        })

        test('are calculated for each edition', async () => {
            const results = [
                editionData([{ id: 'low', count: 1 }]),
                editionData([{ id: 'high', count: 1 }])
            ]
            await addPercentiles(results, rangeAxis, otherAxis)
            expect(results.map(r => r.median)).toEqual([10, 30])
        })
    })

    describe('bucket percentiles (axis2 is a range or numeric question)', () => {
        test('are calculated from each bucket’s facet buckets', async () => {
            const results = [
                editionData([
                    {
                        id: 'chrome',
                        facetBuckets: [
                            { id: 'low', count: 1 },
                            { id: 'mid', count: 1 },
                            { id: 'high', count: 1 }
                        ]
                    },
                    { id: 'firefox', facetBuckets: [{ id: 'high', count: 4 }] }
                ])
            ]
            await addPercentiles(results, otherAxis, rangeAxis)
            const [chrome, firefox] = results[0].buckets
            expect(chrome[PERCENTILES].p0).toBe(10)
            expect(chrome[PERCENTILES].p100).toBe(30)
            expect(chrome[MEDIAN]).toBe(20)
            expect(firefox[MEDIAN]).toBe(30)
            expect(Object.values(firefox[PERCENTILES])).toEqual([30, 30, 30, 30, 30, 30, 30])
            // axis1 isn't a range question, so no edition percentiles
            expect(results[0].percentiles).toBeUndefined()
        })

        test('use option values for slider facet buckets', async () => {
            const results = [
                editionData([
                    {
                        id: 'chrome',
                        facetBuckets: [...Array(9)].map((_, i) => ({ id: i, count: 1 }))
                    }
                ])
            ]
            await addPercentiles(results, otherAxis, sliderAxis)
            expect(results[0].buckets[0][PERCENTILES]).toMatchObject({ p0: 0, p50: 50, p100: 100 })
        })

        test('are calculated for the overall bucket too', async () => {
            const results = [
                editionData([
                    { id: 'chrome', facetBuckets: [{ id: 'low', count: 1 }] },
                    { id: OVERALL, facetBuckets: [{ id: 'high', count: 1 }] }
                ])
            ]
            await addPercentiles(results, otherAxis, rangeAxis)
            expect(results[0].buckets[1][MEDIAN]).toBe(30)
        })

        test('are all 0 for a bucket with insufficient data', async () => {
            const results = [
                editionData([
                    {
                        id: 'chrome',
                        hasInsufficientData: true,
                        facetBuckets: [{ id: 'high', count: 1 }]
                    }
                ])
            ]
            await addPercentiles(results, otherAxis, rangeAxis)
            expect(results[0].buckets[0][PERCENTILES]).toEqual(zeroPercentiles)
            expect(results[0].buckets[0][MEDIAN]).toBe(0)
        })

        test('are all 0 for a bucket without usable facet buckets', async () => {
            const results = [
                editionData([
                    { id: 'chrome', facetBuckets: [] },
                    { id: 'firefox', facetBuckets: [{ id: NO_ANSWER, count: 3 }] }
                ])
            ]
            await addPercentiles(results, otherAxis, rangeAxis)
            for (const bucket of results[0].buckets) {
                expect(bucket[PERCENTILES]).toEqual(zeroPercentiles)
                expect(bucket[MEDIAN]).toBe(0)
            }
        })
    })

    test('calculates both levels when both axes are range questions', async () => {
        const results = [
            editionData([
                { id: 'low', count: 1, facetBuckets: [{ id: 'high', count: 1 }] },
                { id: 'high', count: 1, facetBuckets: [{ id: 'low', count: 1 }] }
            ])
        ]
        await addPercentiles(results, rangeAxis, rangeAxis)
        expect(results[0].median).toBe(20)
        expect(results[0].buckets[0][MEDIAN]).toBe(30)
        expect(results[0].buckets[1][MEDIAN]).toBe(10)
    })

    test('does nothing when neither axis is a range or numeric question', async () => {
        const results = [
            editionData([{ id: 'chrome', count: 1, facetBuckets: [{ id: 'chrome', count: 1 }] }])
        ]
        await addPercentiles(results, otherAxis, otherAxis)
        expect(results[0].percentiles).toBeUndefined()
        expect(results[0].buckets[0][PERCENTILES]).toBeUndefined()
    })

    test('handles results with no editions', async () => {
        await expect(addPercentiles([], rangeAxis, rangeAxis)).resolves.toBeUndefined()
    })
})
