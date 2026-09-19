import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { BucketUnits } from '@devographics/types'
import { NO_ANSWER, NOT_APPLICABLE, OVERALL } from '@devographics/constants'
import { addAverages, calculateAverage, findBucketOption, getBucketAverage } from './add_averages'
import type { ComputeAxisParameters } from '../../types'

const axis = (question: any, options?: any[]) =>
    ({ question, options } as unknown as ComputeAxisParameters)

// salary-like range question
const rangeAxis = axis({ id: 'salary', optionsAreRange: true }, [
    { id: 'low', average: 10 },
    { id: 'high', average: 30 },
    { id: 'na' }
])

// slider: option ids are numbers, each one standing in for a `value`
const sliderAxis = axis(
    { id: 'slider', optionsAreNumeric: true },
    [0, 12.5, 25, 37.5, 50, 62.5, 75, 87.5, 100].map((value, id) => ({ id, value }))
)

// numeric question without any option definitions
const numericAxis = axis({ id: 'hours', optionsAreNumeric: true })

const otherAxis = axis({ id: 'browser' }, [{ id: 'chrome' }])

describe('findBucketOption', () => {
    const options = [{ id: 0, value: 0 }, { id: 1, value: 12.5 }, { id: 'other' }]

    test('matches regardless of whether the ids are numbers or strings', () => {
        expect(findBucketOption(options, { id: 1 })).toBe(options[1])
        expect(findBucketOption(options, { id: '1' })).toBe(options[1])
        expect(findBucketOption([{ id: '2', value: 25 }], { id: 2 })).toEqual({
            id: '2',
            value: 25
        })
        expect(findBucketOption(options, { id: '0' })).toBe(options[0])
        expect(findBucketOption(options, { id: 'other' })).toBe(options[2])
    })

    test('returns undefined when nothing matches or there are no options', () => {
        expect(findBucketOption(options, { id: 'nope' })).toBeUndefined()
        expect(findBucketOption(undefined, { id: 1 })).toBeUndefined()
        expect(findBucketOption([], { id: 1 })).toBeUndefined()
    })
})

describe('getBucketAverage', () => {
    test('range_work_for_free is hardcoded to 0', () => {
        expect(getBucketAverage({ id: 'range_work_for_free' } as any, rangeAxis)).toBe(0)
    })

    test("uses the matching option's average", () => {
        expect(getBucketAverage({ id: 'high' } as any, rangeAxis)).toBe(30)
    })

    test("uses the matching option's value", () => {
        expect(getBucketAverage({ id: 4 } as any, sliderAxis)).toBe(50)
    })

    test('an option value or average of 0 is used, not skipped', () => {
        expect(getBucketAverage({ id: 0 } as any, sliderAxis)).toBe(0)
        const zeroAverage = axis({ id: 'q', optionsAreRange: true }, [{ id: 'zero', average: 0 }])
        expect(getBucketAverage({ id: 'zero' } as any, zeroAverage)).toBe(0)
    })

    test('average takes precedence over value', () => {
        const both = axis({ id: 'q' }, [{ id: 'a', average: 5, value: 9 }])
        expect(getBucketAverage({ id: 'a' } as any, both)).toBe(5)
    })

    /*

    Regression test: merged facet buckets have string ids ("4") while the slider's
    option ids are numbers (4). The option's value (50) must still be found, rather
    than falling back to the raw id (4).

    */
    test('finds the option value when the bucket id is a string but the option id a number', () => {
        expect(getBucketAverage({ id: '4' } as any, sliderAxis)).toBe(50)
        expect(getBucketAverage({ id: '8' } as any, sliderAxis)).toBe(100)
    })

    test('falls back to the numeric id for numeric questions without option values', () => {
        expect(getBucketAverage({ id: '42' } as any, numericAxis)).toBe(42)
        expect(getBucketAverage({ id: 7 } as any, numericAxis)).toBe(7)
    })

    test('a bucket made of grouped buckets averages the grouped buckets', () => {
        const group = { id: 'range_low_high', groupedBuckets: [{ id: 'low' }, { id: 'high' }] }
        expect(getBucketAverage(group as any, rangeAxis)).toBe(20)
    })

    test('grouped buckets are resolved recursively (group of groups)', () => {
        const inner = { id: 'inner', groupedBuckets: [{ id: 'low' }, { id: 'high' }] }
        const outer = { id: 'outer', groupedBuckets: [inner, { id: 'high' }] }
        // (20 + 30) / 2
        expect(getBucketAverage(outer as any, rangeAxis)).toBe(25)
    })

    test('an empty group has an average of 0', () => {
        expect(getBucketAverage({ id: 'empty', groupedBuckets: [] } as any, rangeAxis)).toBe(0)
    })

    describe('when the average cannot be found', () => {
        beforeEach(() => {
            // the function logs the bucket and axis before throwing
            vi.spyOn(console, 'log').mockImplementation(() => {})
        })
        afterEach(() => {
            vi.restoreAllMocks()
        })

        test('throws for a bucket with no matching option on a non-numeric question', () => {
            expect(() => getBucketAverage({ id: 'firefox' } as any, otherAxis)).toThrow(
                /could not find option average for bucket "firefox" with axis "browser"/
            )
        })

        test('throws for an option without average or value on a non-numeric question', () => {
            expect(() => getBucketAverage({ id: 'na' } as any, rangeAxis)).toThrow(
                /could not find option average for bucket "na"/
            )
        })
    })
})

describe('calculateAverage', () => {
    test('is the average of the options, weighted by count', () => {
        const buckets = [
            { id: 'low', count: 3 },
            { id: 'high', count: 1 }
        ]
        // (3 × 10 + 1 × 30) / 4
        expect(calculateAverage({ buckets: buckets as any, axis: rangeAxis })).toBe(15)
    })

    test('rounds to one decimal', () => {
        const buckets = [
            { id: 'low', count: 2 },
            { id: 'high', count: 1 }
        ]
        // 50 / 3 = 16.666…
        expect(calculateAverage({ buckets: buckets as any, axis: rangeAxis })).toBe(16.7)
    })

    test('excludes no_answer and na buckets, which would warp the average towards 0', () => {
        const buckets = [
            { id: 'low', count: 1 },
            { id: 'high', count: 1 },
            { id: NO_ANSWER, count: 100 },
            { id: NOT_APPLICABLE, count: 100 }
        ]
        expect(calculateAverage({ buckets: buckets as any, axis: rangeAxis })).toBe(20)
    })

    test('a bucket whose average is 0 still counts towards the total', () => {
        const buckets = [
            { id: 0, count: 1 }, // value 0
            { id: 8, count: 1 } // value 100
        ]
        expect(calculateAverage({ buckets: buckets as any, axis: sliderAxis })).toBe(50)
    })

    test('uses option values for slider buckets with string ids', () => {
        const buckets = [
            { id: '0', count: 1 },
            { id: '8', count: 1 }
        ]
        expect(calculateAverage({ buckets: buckets as any, axis: sliderAxis })).toBe(50)
    })

    test('a bucket without a count contributes nothing', () => {
        const buckets = [{ id: 'low', count: 2 }, { id: 'high' }]
        expect(calculateAverage({ buckets: buckets as any, axis: rangeAxis })).toBe(10)
    })

    test('is NaN when there is nothing to average (callers must guard against it)', () => {
        expect(calculateAverage({ buckets: [], axis: rangeAxis })).toBeNaN()
        const onlyNoAnswer = [{ id: NO_ANSWER, count: 5 }]
        expect(calculateAverage({ buckets: onlyNoAnswer as any, axis: rangeAxis })).toBeNaN()
        const zeroCounts = [{ id: 'low', count: 0 }]
        expect(calculateAverage({ buckets: zeroCounts as any, axis: rangeAxis })).toBeNaN()
    })
})

describe('addAverages', () => {
    const AVERAGE = BucketUnits.AVERAGE
    const editionData = (buckets: any[]) => ({ editionId: 'e1', buckets } as any)

    describe('edition average (axis1 is a range or numeric question)', () => {
        test('is the average of the top-level buckets', async () => {
            const results = [
                editionData([
                    { id: 'low', count: 1 },
                    { id: 'high', count: 3 }
                ])
            ]
            await addAverages(results, rangeAxis, otherAxis)
            expect(results[0].average).toBe(25)
        })

        test('ignores the overall bucket', async () => {
            const results = [
                editionData([
                    { id: 'low', count: 1 },
                    { id: OVERALL, count: 1000, facetBuckets: [] }
                ])
            ]
            await addAverages(results, rangeAxis, otherAxis)
            expect(results[0].average).toBe(10)
        })

        test('works with numeric questions', async () => {
            const results = [
                editionData([
                    { id: '10', count: 1 },
                    { id: '20', count: 1 }
                ])
            ]
            await addAverages(results, numericAxis, otherAxis)
            expect(results[0].average).toBe(15)
        })

        test('is not set for other questions', async () => {
            const results = [editionData([{ id: 'chrome', count: 1 }])]
            await addAverages(results, otherAxis, otherAxis)
            expect(results[0].average).toBeUndefined()
        })

        test('is calculated for each edition', async () => {
            const results = [
                editionData([{ id: 'low', count: 1 }]),
                editionData([{ id: 'high', count: 1 }])
            ]
            await addAverages(results, rangeAxis, otherAxis)
            expect(results.map(r => r.average)).toEqual([10, 30])
        })
    })

    describe('bucket average (axis2 is a range or numeric question)', () => {
        test('is the average of the bucket’s facet buckets', async () => {
            const results = [
                editionData([
                    {
                        id: 'chrome',
                        facetBuckets: [
                            { id: 'low', count: 1 },
                            { id: 'high', count: 1 },
                            { id: NO_ANSWER, count: 50 }
                        ]
                    },
                    { id: 'firefox', facetBuckets: [{ id: 'high', count: 2 }] }
                ])
            ]
            await addAverages(results, otherAxis, rangeAxis)
            expect(results[0].buckets[0][AVERAGE]).toBe(20)
            expect(results[0].buckets[1][AVERAGE]).toBe(30)
        })

        test('uses option values for slider facet buckets', async () => {
            const results = [
                editionData([
                    {
                        id: 'chrome',
                        facetBuckets: [
                            { id: 0, count: 1 },
                            { id: 8, count: 1 }
                        ]
                    }
                ])
            ]
            await addAverages(results, otherAxis, sliderAxis)
            expect(results[0].buckets[0][AVERAGE]).toBe(50)
        })

        test('is not set when there is nothing to average (would be NaN)', async () => {
            const results = [
                editionData([
                    { id: 'chrome', facetBuckets: [{ id: NO_ANSWER, count: 3 }] },
                    { id: 'firefox', facetBuckets: [] }
                ])
            ]
            await addAverages(results, otherAxis, rangeAxis)
            expect(results[0].buckets[0][AVERAGE]).toBeUndefined()
            expect(results[0].buckets[1][AVERAGE]).toBeUndefined()
        })

        test('is 0 for a bucket with insufficient data', async () => {
            const results = [
                editionData([
                    {
                        id: 'chrome',
                        hasInsufficientData: true,
                        facetBuckets: [{ id: 'high', count: 1 }]
                    }
                ])
            ]
            await addAverages(results, otherAxis, rangeAxis)
            expect(results[0].buckets[0][AVERAGE]).toBe(0)
        })

        test('is skipped for the "na" (not applicable) bucket', async () => {
            const results = [
                editionData([
                    { id: NOT_APPLICABLE, facetBuckets: [{ id: 'high', count: 1 }] },
                    { id: NOT_APPLICABLE, hasInsufficientData: true }
                ])
            ]
            await addAverages(results, otherAxis, rangeAxis)
            expect(results[0].buckets[0][AVERAGE]).toBeUndefined()
            expect(results[0].buckets[1][AVERAGE]).toBeUndefined()
        })
    })

    describe('bucket average without a facet', () => {
        test('uses the hardcoded average of the bucket’s option', async () => {
            const results = [
                editionData([
                    { id: 'low', count: 1 },
                    { id: 'high', count: 1 },
                    { id: 'na', count: 1 }
                ])
            ]
            await addAverages(results, rangeAxis, otherAxis)
            expect(results[0].buckets[0][AVERAGE]).toBe(10)
            expect(results[0].buckets[1][AVERAGE]).toBe(30)
            // "na" option has no average
            expect(results[0].buckets[2][AVERAGE]).toBeUndefined()
        })

        test('is not set for a bucket with an option average of 0', async () => {
            // note: `else if (option?.average)` is falsy for 0
            const zeroAxis = axis({ id: 'q', optionsAreRange: true }, [{ id: 'zero', average: 0 }])
            const results = [editionData([{ id: 'zero', count: 1 }])]
            await addAverages(results, zeroAxis, otherAxis)
            expect(results[0].buckets[0][AVERAGE]).toBeUndefined()
        })

        test('throws when a top-level bucket has no matching option', async () => {
            // the edition average is computed from all top-level buckets first, so
            // an unknown bucket id (this runs before "other"/cutoff buckets are
            // created) is an error rather than being skipped
            vi.spyOn(console, 'log').mockImplementation(() => {})
            const results = [editionData([{ id: 'unknown', count: 1 }])]
            await expect(addAverages(results, rangeAxis, otherAxis)).rejects.toThrow(
                /could not find option average for bucket "unknown"/
            )
            vi.restoreAllMocks()
        })

        test('is 0 for a bucket with insufficient data', async () => {
            const results = [editionData([{ id: 'low', count: 1, hasInsufficientData: true }])]
            await addAverages(results, rangeAxis, otherAxis)
            expect(results[0].buckets[0][AVERAGE]).toBe(0)
        })
    })

    test('handles results with no editions', async () => {
        await expect(addAverages([], rangeAxis, otherAxis)).resolves.toBeUndefined()
    })
})
