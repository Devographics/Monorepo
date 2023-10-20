import {
    ComputeAxisParameters,
    ResponseEditionData,
    Bucket,
    FacetBucket,
    Survey
} from '../../types'
import isEmpty from 'lodash/isEmpty.js'
import sumBy from 'lodash/sumBy.js'
import difference from 'lodash/difference.js'
import { NO_ANSWER } from '@devographics/constants'

/*

Discard any result where id is {}, "", [], etc. 

*/
export async function discardEmptyIds(resultsByEdition: ResponseEditionData[]) {
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

Discard any empty editions (editions that contain only no_answer buckets)

*/
export async function discardEmptyEditions(resultsByEdition: ResponseEditionData[]) {
    return resultsByEdition.filter(
        editionData =>
            !(editionData.buckets.length === 1 && editionData.buckets[0].id === NO_ANSWER)
    )
}

/*

When adding a facet, the "default" bucket counts will disappear. 

Add them back. 

NOTE: data is slightly off because it doesn't account for people who didn't answer question

TODO: get rid of this using mongo pipeline

*/
export async function addDefaultBucketCounts(resultsByEdition: ResponseEditionData[]) {
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
export async function moveFacetBucketsToDefaultBuckets(resultsByEdition: ResponseEditionData[]) {
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
    percentageQuestion: 0,
    percentageBucket: 0,
    percentageSurvey: 0
}
const getZeroBucketItem = <T extends Bucket | FacetBucket>({
    id,
    hasInsufficientData,
    axis
}: {
    id: string
    hasInsufficientData?: boolean
    axis?: ComputeAxisParameters
}) => {
    let zeroBucket = { ...zeroBucketItem, id } as T
    if (axis) {
        zeroBucket = {
            ...zeroBucket,
            facetBuckets: axis.question.options?.map(o => ({
                ...zeroBucketItem,
                id: o.id
            }))
        }
    }
    if (hasInsufficientData) {
        zeroBucket = {
            ...zeroBucket,
            hasInsufficientData
        }
    }
    return zeroBucket
}

export async function addMissingItems(
    resultsByEdition: ResponseEditionData[],
    axis1: ComputeAxisParameters,
    axis2?: ComputeAxisParameters
) {
    for (const editionData of resultsByEdition) {
        const { editionId, buckets } = editionData

        if (axis1.question.options) {
            const options1 = axis1.question.options.filter(o => o.editions?.includes(editionId))
            for (const option1 of options1) {
                const existingBucketItem = buckets.find(
                    bucket => String(bucket.id) === String(option1.id)
                )
                if (existingBucketItem) {
                    const hasInsufficientData = existingBucketItem.hasInsufficientData

                    if (axis2?.question?.options) {
                        const options2 = axis2?.question?.options.filter(o =>
                            o.editions?.includes(editionId)
                        )
                        // check facet buckets
                        for (const option2 of options2) {
                            const existingFacetBucketItem = existingBucketItem.facetBuckets?.find(
                                bucket => bucket.id === option2.id
                            )
                            if (!existingFacetBucketItem) {
                                existingBucketItem.facetBuckets?.push(
                                    getZeroBucketItem<FacetBucket>({
                                        id: String(option2.id),
                                        hasInsufficientData
                                    })
                                )
                            }
                        }
                    }
                } else {
                    buckets.push(getZeroBucketItem<Bucket>({ id: String(option1.id), axis: axis2 }))
                }
            }
        }
    }
}

export async function addEditionYears(resultsByEdition: ResponseEditionData[], survey: Survey) {
    for (let editionData of resultsByEdition) {
        const edition = survey.editions.find(e => e.id === editionData.editionId)
        if (edition) {
            editionData.year = edition.year
        }
    }
}

/*

Some results do not have an edition assigned to them, so remove them for now

Note: not needed if db is properly cleaned up

*/
export async function removeEmptyEditions(resultsByEdition: ResponseEditionData[]) {
    return resultsByEdition.filter(editionData => editionData.editionId !== null)
}

// TODO
// add means
// export async function addMeans(resultsByEdition: ResponseEditionData[], values: string[] | number[]) {
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

/*

Add labels to buckets (only used for country names currently)

*/
export async function addLabels(
    resultsByEdition: ResponseEditionData[],
    axis1: ComputeAxisParameters,
    axis2?: ComputeAxisParameters | null
) {
    for (const editionData of resultsByEdition) {
        for (const bucket of editionData.buckets) {
            const label1 = axis1.question.options?.find(o => o.id === bucket.id)?.label
            if (label1) {
                bucket.label = label1
            }
            if (bucket.facetBuckets && axis2) {
                for (const facetBucket of bucket.facetBuckets) {
                    const label2 = axis2.question.options?.find(o => o.id === facetBucket.id)?.label
                    if (label2) {
                        facetBucket.label = label2
                    }
                }
            }
        }
    }
}
