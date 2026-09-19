import { beforeEach, describe, expect, test, vi, type Mock } from 'vitest'
import { detectNaN } from './detect_nan'
import { logToFile } from '@devographics/debug'

vi.mock('@devographics/debug', () => ({ logToFile: vi.fn() }))

const logToFileMock = logToFile as Mock

const editionData = (buckets: any[], extra: any = {}) =>
    ({ editionId: 'js2025', buckets, ...extra } as any)

describe('detectNaN', () => {
    beforeEach(() => {
        logToFileMock.mockClear()
    })

    test('resolves when there is no NaN', async () => {
        const results = [
            editionData(
                [
                    {
                        id: 'a',
                        count: 3,
                        averageByFacet: 12.5,
                        percentiles: { p0: 0, p50: 5, p100: 8 },
                        facetBuckets: [{ id: 'x', count: 1 }]
                    }
                ],
                { average: 4 }
            )
        ]
        await expect(detectNaN(results, false, 'logs')).resolves.toBeUndefined()
        expect(logToFileMock).not.toHaveBeenCalled()
    })

    test('resolves for empty results', async () => {
        await expect(detectNaN([], false, 'logs')).resolves.toBeUndefined()
        await expect(detectNaN([editionData([])], false, 'logs')).resolves.toBeUndefined()
    })

    /*

    Regression test: detectNaN used to not await its traversal, so the error it
    threw became an unhandled promise rejection (crashing the process) instead of
    rejecting the returned promise, where Apollo can turn it into a GraphQL error.

    */
    test('rejects (rather than crashing) when a NaN is found', async () => {
        const results = [editionData([{ id: 'a', count: NaN }])]
        await expect(detectNaN(results, false, 'logs')).rejects.toThrow(/Detected NaN value/)
    })

    test('reports the path of the NaN value', async () => {
        const results = [
            editionData([
                { id: 'a', count: 1 },
                { id: 'b', count: 1, averageByFacet: NaN }
            ])
        ]
        await expect(detectNaN(results, false, 'logs')).rejects.toThrow(
            /path 0,buckets,1,averageByFacet/
        )
    })

    test('finds NaN deep inside facet buckets and percentiles', async () => {
        const inFacetBuckets = [
            editionData([
                {
                    id: 'a',
                    facetBuckets: [
                        { id: 'x', count: 1 },
                        { id: 'y', percentageBucket: NaN }
                    ]
                }
            ])
        ]
        await expect(detectNaN(inFacetBuckets, false, 'logs')).rejects.toThrow(
            /0,buckets,0,facetBuckets,1,percentageBucket/
        )

        const inPercentiles = [editionData([{ id: 'a', percentiles: { p0: 0, p50: NaN } }])]
        await expect(detectNaN(inPercentiles, false, 'logs')).rejects.toThrow(
            /0,buckets,0,percentiles,p50/
        )
    })

    test('finds NaN in an array of primitives', async () => {
        const results = [editionData([{ id: 'a', values: [1, 2, NaN] }])]
        await expect(detectNaN(results, false, 'logs')).rejects.toThrow(/0,buckets,0,values,2/)
    })

    test('writes the offending results to `results_error.yml` inside logPath', async () => {
        const results = [editionData([{ id: 'a', count: NaN }])]
        await expect(detectNaN(results, false, 'some/log/path')).rejects.toThrow()
        expect(logToFileMock).toHaveBeenCalledWith('some/log/path/results_error.yml', results)
    })

    test('does not treat other falsy or odd values as NaN', async () => {
        const results = [
            editionData([
                {
                    id: 'NaN', // the *string* "NaN" is fine
                    count: 0,
                    label: '',
                    average: null,
                    missing: undefined,
                    isFlag: false,
                    ratio: Infinity,
                    negative: -Infinity
                }
            ])
        ]
        await expect(detectNaN(results, false, 'logs')).resolves.toBeUndefined()
    })
})
