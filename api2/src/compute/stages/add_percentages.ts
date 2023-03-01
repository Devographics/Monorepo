import { EditionData, Bucket, ComputeAxisParameters } from '../../types'
import { ratioToPercentage } from '../common'
import sum from 'lodash/sum.js'

const computeBucketsWithPercentages = (
    buckets: Bucket[],
    editionData: EditionData,
    isFacet: boolean = false
) => {
    console.log('// computeBucketsWithPercentages')
    console.log(editionData)
    const bucketsWithPercentages = buckets.map(bucket => {
        const bucketWithPercentages = { ...bucket }
        bucketWithPercentages.percentage_survey = ratioToPercentage(
            bucket.count / editionData.completion.total
        )
        bucketWithPercentages.percentage_question = ratioToPercentage(
            bucket.count / editionData.completion.count
        )
        // if (isFacet) {
        //     bucketWithPercentages.percentage_facet = ratioToPercentage(
        //         bucket.count / facet.completion.count
        //     )

        //     const allCounts = editionData.facets.map(
        //         (f: FacetItem) => f.buckets.find(b => b.id === bucket.id)?.count || 0
        //     )
        //     bucketWithPercentages.count_all_facets = sum(allCounts)
        //     bucketWithPercentages.percentage_all_facets = ratioToPercentage(
        //         bucket.count_all_facets / editionData.completion.count
        //     )
        // }
        return bucketWithPercentages
    })
    console.log(bucketsWithPercentages)
    return bucketsWithPercentages
}

export async function addPercentages(resultsByEdition: EditionData[]) {
    for (let editionData of resultsByEdition) {
        editionData.buckets = computeBucketsWithPercentages(editionData.buckets, editionData)
        for (let bucket of editionData.buckets) {
            if (bucket.facetBuckets) {
                bucket.facetBuckets = computeBucketsWithPercentages(
                    bucket.facetBuckets,
                    editionData,
                    true
                )
            }
        }
    }
}
