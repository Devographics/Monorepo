import { describe, expect, test } from 'vitest'
import { NO_ANSWER, NOT_APPLICABLE } from '@devographics/constants'
import { addFacetAnsweredCounts } from './other'
import { applyBucketCutoff } from './apply_dataset_cutoff'
import { mergeBuckets } from './mergeBuckets'
import type { Bucket, ComputeAxisParameters, ResponseEditionData } from '../../types'

const salaryAxis = {
    question: { id: 'yearly_salary', optionsAreRange: true },
    sort: 'options',
    order: 1,
    cutoff: 0,
    limit: 100,
    options: [{ id: 'low', average: 10000 }, { id: 'high', average: 200000 }]
} as unknown as ComputeAxisParameters

const experienceAxis = {
    question: { id: 'years_of_experience' },
    sort: 'count',
    order: -1,
    cutoff: 0,
    limit: 100
} as unknown as ComputeAxisParameters

const getBucket = (id: string, facets: Array<[string, number]>) => {
    let count = 0
    for (const [, facetCount] of facets) {
        count += facetCount
    }
    return {
        id,
        count,
        facetBuckets: facets.map(([facetId, facetCount]) => ({ id: facetId, count: facetCount }))
    } as unknown as Bucket
}

const getCountedBucket = async (id: string, facets: Array<[string, number]>) => {
    const bucket = getBucket(id, facets)
    await addFacetAnsweredCounts([{ buckets: [bucket] } as unknown as ResponseEditionData])
    return bucket
}

describe('addFacetAnsweredCounts', () => {
    test('leaves out respondents who did not answer the facet question', async () => {
        const bucket = await getCountedBucket('range_1_3', [
            ['low', 60],
            ['high', 30],
            [NO_ANSWER, 10],
            [NOT_APPLICABLE, 4]
        ])
        expect(bucket.count).toBe(104)
        expect(bucket.facetAnsweredCount).toBe(90)
    })

    test('is zero when nobody answered', async () => {
        const bucket = await getCountedBucket('range_1_3', [[NO_ANSWER, 10]])
        expect(bucket.facetAnsweredCount).toBe(0)
    })
})

describe('facetAnsweredCount in later stages', () => {
    test('is summed when top-level buckets get grouped', async () => {
        const merged = mergeBuckets<Bucket>({
            buckets: [
                await getCountedBucket('1', [
                    ['low', 20],
                    [NO_ANSWER, 5]
                ]),
                await getCountedBucket('2', [
                    ['high', 15],
                    [NO_ANSWER, 5]
                ])
            ],
            mergedProps: { id: 'range_1_3' },
            primaryAxis: experienceAxis,
            secondaryAxis: salaryAxis
        })
        expect(merged.count).toBe(45)
        expect(merged.facetAnsweredCount).toBe(35)
    })

    test('is zeroed out along with count when a bucket falls under the cutoff', async () => {
        const bucket = await getCountedBucket('range_1_3', [
            ['low', 3],
            [NO_ANSWER, 2]
        ])
        const cutoffBucket = applyBucketCutoff({
            bucket,
            hasFilter: false,
            hasFacet: true,
            axis1: salaryAxis,
            axis2: experienceAxis
        })
        expect(cutoffBucket.count).toBe(0)
        expect(cutoffBucket.facetAnsweredCount).toBe(0)
    })
})
