import { describe, expect, test, vi } from 'vitest'
import { OVERALL } from '@devographics/constants'
import { addOverallBucket } from './add_overall_bucket'
import { genericComputeFunction, GenericComputeOptions } from '../generic'
import type { ComputeAxisParameters, ResponseEditionData } from '../../types'

vi.mock('../generic', () => ({
    genericComputeFunction: vi.fn(),
    convertOrderReverse: () => 'asc'
}))

const axis = { question: { id: 'yearly_salary' } } as unknown as ComputeAxisParameters
const options = { computeArguments: {} } as unknown as GenericComputeOptions

const getOverallResults = (editionId: string, count: number) =>
    ({
        editionId,
        completion: { count },
        buckets: [{ id: 'low', count }]
    }) as unknown as ResponseEditionData

const getEditionData = (editionId: string) =>
    ({ editionId, buckets: [] }) as unknown as ResponseEditionData

const getOverallCount = (editionData: ResponseEditionData) =>
    editionData.buckets.find(b => b.id === OVERALL)?.count

describe('addOverallBucket', () => {
    test('uses the overall results of the matching edition', async () => {
        vi.mocked(genericComputeFunction).mockResolvedValue([
            getOverallResults('td2025', 500),
            getOverallResults('td2026', 648)
        ])
        const results = [getEditionData('td2025'), getEditionData('td2026')]
        await addOverallBucket(results, axis, options)
        expect(getOverallCount(results[0])).toBe(500)
        expect(getOverallCount(results[1])).toBe(648)
    })

    test('adds no overall bucket when an edition has no overall results', async () => {
        vi.mocked(genericComputeFunction).mockResolvedValue([getOverallResults('td2026', 648)])
        const results = [getEditionData('td2025'), getEditionData('td2026')]
        await addOverallBucket(results, axis, options)
        expect(results[0].buckets).toEqual([])
        expect(getOverallCount(results[1])).toBe(648)
    })
})
