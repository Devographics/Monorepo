import { ComputeAxisParameters, EditionData, Bucket, FacetBucket } from '../../types'
import isEmpty from 'lodash/isEmpty.js'
import sumBy from 'lodash/sumBy.js'
import difference from 'lodash/difference.js'

/*

Discard any result where id is {}, "", [], etc. 

*/
export async function discardEmptyIds(resultsByEdition: EditionData[]) {
    for (let editionData of resultsByEdition) {
        editionData.buckets = editionData.buckets.filter(
            b => typeof b.id === 'number' || !isEmpty(b.id)
        )
        for (let bucket of editionData.buckets) {
            if (bucket.facetBuckets) {
                bucket.facetBuckets = bucket.facetBuckets.filter(
                    b => typeof b.id === 'number' || !isEmpty(b.id)
                )
            }
        }
    }
}

/*

When adding a facet, the "default" bucket counts will disappear. 

Add them back. 

NOTE: data is slightly off because it doesn't account for people who didn't answer question

TODO: get rid of this using mongo pipeline

*/
export async function addDefaultBucketCounts(resultsByEdition: EditionData[]) {
    for (let editionData of resultsByEdition) {
        for (let bucket of editionData.buckets) {
            bucket.count = sumBy(bucket.facetBuckets, 'count')
        }
    }
}
/*
        
When no facet is specified, move default buckets down one level

TODO: get rid of this

*/
export async function moveFacetBucketsToDefaultBuckets(resultsByEdition: EditionData[]) {
    for (let editionData of resultsByEdition) {
        editionData.buckets = editionData.buckets[0].facetBuckets as Bucket[]
    }
    return resultsByEdition
}

/*

If aggregation has options defined, set any missing value to 0
so that all buckets have the same shape

*/
const zeroBucketItem = {
    count: 0,
    percentage_question: 0,
    percentage_facet: 0,
    percentage_survey: 0
}
const getZeroBucketItem = (id: string, facetAxis?: ComputeAxisParameters) => ({
    ...zeroBucketItem,
    id,
    facetBuckets: (facetAxis
        ? facetAxis.question.options?.map(o => ({
              ...zeroBucketItem,
              id: o.id
          }))
        : []) as FacetBucket[]
})

export async function addMissingItems(
    resultsByEdition: EditionData[],
    axis1: ComputeAxisParameters,
    axis2?: ComputeAxisParameters
) {
    for (let editionData of resultsByEdition) {
        if (axis1.question.options) {
            console.log('// addMissingItems')
            console.log(axis1.question.options)
            console.log(editionData.buckets)
            for (const option1 of axis1.question.options) {
                const existingBucketItem = editionData.buckets.find(
                    bucket => bucket.id === option1.id
                )
                if (existingBucketItem) {
                    if (axis2?.question?.options) {
                        // check facet buckets
                        for (const option2 of axis2.question.options) {
                            const existingFacetBucketItem = existingBucketItem.facetBuckets?.find(
                                bucket => bucket.id === option2.id
                            )
                            if (!existingFacetBucketItem) {
                                existingBucketItem.facetBuckets?.push(getZeroBucketItem(option2.id))
                            }
                        }
                    }
                } else {
                    editionData.buckets.push(getZeroBucketItem(option1.id, axis2))
                }
            }
        }
    }
}

// TODO
// add means
// export async function addMeans(resultsByEdition: EditionData[], values: string[] | number[]) {
//     for (let year of resultsByEdition) {
//         for (let facet of year.facets) {
//             let totalValue = 0
//             let totalCount = 0
//             const coeffs = values.map((id, index) => ({ id, coeff: index + 1 }))
//             facet.buckets.forEach((bucket, index) => {
//                 const { count, id } = bucket
//                 const coeff = coeffs.find(c => c.id === id)?.coeff ?? 1
//                 totalValue += count * coeff
//                 totalCount += count
//             })
//             facet.mean = round(totalValue / totalCount, 2)
//         }
//     }
// }
