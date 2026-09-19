import { mergeBuckets } from './mergeBuckets'
import { zeroPercentiles } from './add_percentiles'
import { BucketUnits } from '@devographics/types'
import type { Bucket } from '../../types'
import type { ComputeAxisParameters } from '../../types'

/*

Merging top-level buckets that carry facet stats (a numeric main question,
grouped into bands, faceted by a range question like salary).

*/

// salary bands, as the facet axis
const salaryAxis = {
    question: { id: 'yearly_salary', optionsAreRange: true },
    sort: 'options',
    order: 1,
    cutoff: 0,
    limit: 100,
    options: [
        { id: 'low', average: 10000 },
        { id: 'high', average: 200000 },
        { id: 'na' }
    ]
} as unknown as ComputeAxisParameters

// raw hour values, as the main axis
const hoursAxis = {
    question: { id: 'work_hours_per_week', optionsAreNumeric: true },
    sort: 'count',
    order: -1,
    cutoff: 0,
    limit: 100
} as unknown as ComputeAxisParameters

const facet = (id: string, count: number) => ({ id, count, index: 0 })

const bucket = (id: string, facets: Array<[string, number]>, extra: Partial<Bucket> = {}) =>
    ({
        id,
        count: facets.reduce((sum, [, count]) => sum + count, 0),
        facetBuckets: facets.map(([facetId, count]) => facet(facetId, count)),
        ...extra
    } as Bucket)

describe('mergeBuckets', () => {
    // 60 hours: three high earners and one "prefer not to say";
    // 168 hours: one low earner. Each bucket arrives with its own stats, the
    // way addAverages/addPercentiles leave them before grouping.
    const sixty = bucket(
        '60',
        [
            ['high', 3],
            ['na', 1]
        ],
        {
            [BucketUnits.AVERAGE]: 200000,
            [BucketUnits.PERCENTILES]: { ...zeroPercentiles, p50: 200000 }
        }
    )
    const marathon = bucket('168', [['low', 1]], {
        [BucketUnits.AVERAGE]: 10000,
        [BucketUnits.PERCENTILES]: { ...zeroPercentiles, p50: 10000 }
    })

    test('percentiles come from the union of the facet buckets, not the sub-bucket percentiles', () => {
        const merged = mergeBuckets<Bucket>({
            buckets: [sixty, marathon],
            mergedProps: { id: 'range_over_50' },
            primaryAxis: hoursAxis,
            secondaryAxis: salaryAxis
        })
        // union of salaries: [10k, 200k, 200k, 200k]
        expect(merged[BucketUnits.PERCENTILES]).toEqual({
            p0: 10000,
            p10: 67000,
            p25: 152500,
            p50: 200000,
            p75: 200000,
            p90: 200000,
            p100: 200000
        })
        expect(merged[BucketUnits.MEDIAN]).toBe(200000)
        // the old unweighted mean of the two p50s would have been 105000
    })

    test('average weights respondents who gave a salary, not bucket totals', () => {
        const merged = mergeBuckets<Bucket>({
            buckets: [sixty, marathon],
            mergedProps: { id: 'range_over_50' },
            primaryAxis: hoursAxis,
            secondaryAxis: salaryAxis
        })
        // (10k + 3 × 200k) / 4; weighting sub-bucket averages by their total
        // count would have counted the na respondent as a 200k earner
        expect(merged[BucketUnits.AVERAGE]).toBe(152500)
        expect(merged.facetBuckets.map(f => [f.id, f.count])).toEqual([
            ['low', 1],
            ['high', 3],
            ['na', 1]
        ])
    })

    test('a merged bucket with insufficient data gets zeroed stats', () => {
        const merged = mergeBuckets<Bucket>({
            buckets: [
                { ...sixty, hasInsufficientData: true },
                { ...marathon, hasInsufficientData: true }
            ],
            mergedProps: { id: 'range_over_50' },
            primaryAxis: hoursAxis,
            secondaryAxis: salaryAxis
        })
        expect(merged.hasInsufficientData).toBe(true)
        expect(merged[BucketUnits.PERCENTILES]).toEqual(zeroPercentiles)
        expect(merged[BucketUnits.AVERAGE]).toBe(0)
    })

    test('nothing to average (facets all na/no_answer or zero-count) gives 0, not NaN', () => {
        const withStats = { [BucketUnits.AVERAGE]: 0, [BucketUnits.PERCENTILES]: zeroPercentiles }
        const merged = mergeBuckets<Bucket>({
            buckets: [
                bucket('overlimit_answers', [['na', 2]], withStats),
                bucket('cutoff_answers', [['na', 1]], withStats)
            ],
            mergedProps: { id: 'other_answers' },
            primaryAxis: hoursAxis,
            secondaryAxis: salaryAxis
        })
        expect(merged[BucketUnits.AVERAGE]).toBe(0)
        expect(merged[BucketUnits.MEDIAN]).toBe(0)

        const zeroCount = mergeBuckets<Bucket>({
            buckets: [
                bucket('overlimit_answers', [['low', 0]], withStats),
                bucket('cutoff_answers', [['low', 0]], withStats)
            ],
            mergedProps: { id: 'other_answers' },
            primaryAxis: hoursAxis,
            secondaryAxis: salaryAxis
        })
        expect(zeroCount[BucketUnits.AVERAGE]).toBe(0)
        expect(zeroCount.facetBuckets[0][BucketUnits.PERCENTAGE_BUCKET]).toBe(0)
    })

    test('buckets without facet stats get none', () => {
        const merged = mergeBuckets<Bucket>({
            buckets: [bucket('60', [['high', 3]]), bucket('168', [['low', 1]])],
            mergedProps: { id: 'range_over_50' },
            primaryAxis: hoursAxis,
            secondaryAxis: salaryAxis
        })
        expect(merged[BucketUnits.PERCENTILES]).toBeUndefined()
        expect(merged[BucketUnits.AVERAGE]).toBeUndefined()
    })

    test('without a facet, hardcoded option averages are combined by count', () => {
        const merged = mergeBuckets<Bucket>({
            buckets: [
                { id: 'a', count: 3, [BucketUnits.AVERAGE]: 100 } as Bucket,
                { id: 'b', count: 1, [BucketUnits.AVERAGE]: 500 } as Bucket
            ],
            mergedProps: { id: 'group' },
            primaryAxis: hoursAxis
        })
        expect(merged[BucketUnits.AVERAGE]).toBe(200)
        expect(merged[BucketUnits.PERCENTILES]).toBeUndefined()
    })
})
