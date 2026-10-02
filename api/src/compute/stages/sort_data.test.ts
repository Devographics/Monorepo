import { describe, expect, test } from 'vitest'
import { sortBuckets } from './sort_data'
import { NO_ANSWER } from '@devographics/constants'
import type { Bucket, ComputeAxisParameters } from '../../types'

const groupedAxis = (enableBucketGroups: boolean) =>
    ({
        question: {
            id: 'yearly_salary',
            groups: [{ id: 'range_low' }, { id: 'range_high' }]
        },
        enableBucketGroups,
        sort: 'options',
        order: 1,
        cutoff: 0,
        limit: 100,
        options: [{ id: 'low_a' }, { id: 'low_b' }, { id: 'high_a' }, { id: 'ungrouped' }]
    } as unknown as ComputeAxisParameters)

const ids = (buckets: Bucket[]) => buckets.map(b => b.id)
const buckets = (...ids: string[]) => ids.map(id => ({ id, count: 1 } as Bucket))

describe('sortBuckets', () => {
    test('group buckets follow the order of the groups', () => {
        const sorted = sortBuckets(
            buckets(NO_ANSWER, 'ungrouped', 'range_high', 'range_low'),
            groupedAxis(true)
        )
        // buckets that didn't match any group come after the groups
        expect(ids(sorted)).toEqual(['range_low', 'range_high', 'ungrouped', NO_ANSWER])
    })

    test('the children of a group follow the order of the options', () => {
        const sorted = sortBuckets(buckets('high_a', 'low_b', 'low_a'), groupedAxis(true))
        expect(ids(sorted)).toEqual(['low_a', 'low_b', 'high_a'])
    })

    test('groups are ignored when bucket grouping is disabled', () => {
        const sorted = sortBuckets(buckets('range_high', 'high_a', 'low_a'), groupedAxis(false))
        expect(ids(sorted)).toEqual(['low_a', 'high_a', 'range_high'])
    })
})
