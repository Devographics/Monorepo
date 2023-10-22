import {
    BucketData,
    BucketUnits,
    FacetBucket,
    Option,
    OptionGroup,
    OptionId
} from '@devographics/types'
import { ResponseEditionData, ComputeAxisParameters, Bucket } from '../../types'
import sumBy from 'lodash/sumBy.js'
import { CUTOFF_ANSWERS, NO_ANSWER, NO_MATCH, OTHER_ANSWERS } from '@devographics/constants'

/*

Take a selected range of buckets and a specific facet id, 
and generate a new facet bucket where each value is the sum of all 
corresponding facet buckets in the selected range of buckets

*/
const getCombinedFacetBucket = (selectedBuckets: Bucket[], facetBucketId: OptionId) => {
    const facetBucket = {} as BucketData
    const units = [
        BucketUnits.COUNT,
        BucketUnits.PERCENTAGE_BUCKET,
        BucketUnits.PERCENTAGE_QUESTION,
        BucketUnits.PERCENTAGE_SURVEY
    ]
    units.forEach(unit_ => {
        const unit = unit_ as keyof BucketData
        facetBucket[unit] = sumBy(selectedBuckets, b => {
            const facetBuckets = b?.facetBuckets?.find(fb => fb.id === facetBucketId)
            return facetBuckets?.[unit] || 0
        })
    })
    return facetBucket
}

/*

Take a range of selected buckets and a list of options, 

*/
export const combineFacetBuckets = (
    selectedBuckets: Bucket[],
    axis?: ComputeAxisParameters
): FacetBucket[] => {
    const optionsOrGroups =
        axis?.enableBucketGroups && axis?.question.groups ? axis.question.groups : axis?.options
    if (!optionsOrGroups) {
        return []
    }
    const combinedFacetBuckets = optionsOrGroups.map(option => {
        const { id, label } = option
        const combinedData = getCombinedFacetBucket(selectedBuckets, option.id)
        return {
            // Note: might create issues when option ID is not the same as facet bucket ID
            id: String(id),
            label,
            ...combinedData
        }
    })
    return combinedFacetBuckets
}

const isInBounds = (n: number, lowerBound?: number, upperBound?: number) => {
    if (lowerBound && upperBound) {
        return n >= lowerBound && n < upperBound
    } else if (lowerBound) {
        return n >= lowerBound
    } else if (upperBound) {
        return n < upperBound
    } else {
        throw new Error(`isInBounds: no bounds specified`)
    }
}

const getMergedBucket = <T extends Bucket | FacetBucket>(
    buckets: T[],
    id: string,
    axis?: ComputeAxisParameters
) => {
    const bucket = {
        id,
        count: sumBy(buckets, 'count'),
        percentageSurvey: Math.round(100 * sumBy(buckets, 'percentageSurvey')) / 100,
        percentageQuestion: Math.round(100 * sumBy(buckets, 'percentageQuestion')) / 100,
        percentageBucket: Math.round(100 * sumBy(buckets, 'percentageBucket')) / 100,
        groupedBucketIds: buckets.map(b => b.id)
    } as T
    if (axis) {
        ;(bucket as Bucket).facetBuckets = combineFacetBuckets(buckets as Bucket[], axis)
    }
    if (buckets.every(b => !!b.hasInsufficientData)) {
        // if every bucket we merge has insufficient data, consider
        // that the merged bucket also has insufficient data
        bucket.hasInsufficientData = true
    }
    return bucket
}

function getGroupedBuckets<T extends Bucket | FacetBucket>({
    groups,
    buckets,
    axis
}: {
    groups: OptionGroup[]
    buckets: T[]
    axis?: ComputeAxisParameters
}) {
    const noAnswerBucket = buckets.find(b => b.id === NO_ANSWER)
    let groupedBuckets = groups.map(group => {
        const { id, upperBound, lowerBound, items } = group
        let selectedBuckets
        if (lowerBound || upperBound) {
            selectedBuckets = buckets.filter(b => isInBounds(Number(b.id), lowerBound, upperBound))
        } else if (items) {
            selectedBuckets = buckets.filter(b => items.includes(b.id))
        } else {
            throw new Error(
                `groupBuckets: please specify lowerBound/upperBound or items array for group ${id}`
            )
        }
        const bucket = getMergedBucket<T>(selectedBuckets, id, axis)
        return bucket
    })

    groupedBuckets = noAnswerBucket ? [...groupedBuckets, noAnswerBucket] : groupedBuckets
    return groupedBuckets
}
/*

Take a list of groups and group the buckets in each edition dataset
according to those groups, either based on lower/upper bounds; 
or on a preset list of ids. 

*/
export async function groupBuckets(
    resultsByEdition: ResponseEditionData[],
    axis1: ComputeAxisParameters,
    axis2?: ComputeAxisParameters
) {
    for (let editionData of resultsByEdition) {
        if (axis2 && axis2.enableBucketGroups && axis2.question.groups) {
            // first, group facetBuckets if needed
            for (let bucket of editionData.buckets) {
                bucket.facetBuckets = getGroupedBuckets<FacetBucket>({
                    groups: axis2.question.groups,
                    buckets: bucket.facetBuckets
                })
            }
        }
        if (axis1.enableBucketGroups && axis1.question.groups) {
            const groupedBuckets = getGroupedBuckets<Bucket>({
                groups: axis1.question.groups,
                buckets: editionData.buckets,
                axis: axis2
            })
            editionData.buckets = groupedBuckets
        }
    }
}

export async function groupOtherBuckets(
    resultsByEdition: ResponseEditionData[],
    axis1: ComputeAxisParameters,
    axis2?: ComputeAxisParameters
) {
    for (let editionData of resultsByEdition) {
        if (axis1.mergeOtherBuckets) {
            // if mergeOtherBuckets is enabled, merge cutoff answers
            // and unmatched answers into a single "other answers" bucket
            const mainBuckets = editionData.buckets.filter(
                b => ![CUTOFF_ANSWERS, NO_MATCH].includes(b.id)
            )
            const cutoffBucket = editionData.buckets.find(b => b.id === CUTOFF_ANSWERS)
            const unmatchedBucket = editionData.buckets.find(b => b.id === NO_MATCH)
            if (cutoffBucket && unmatchedBucket) {
                // if both buckets exist, combine them into one
                const combinedOtherBucket = getMergedBucket(
                    [cutoffBucket, unmatchedBucket],
                    OTHER_ANSWERS,
                    axis2
                )
                editionData.buckets = [...mainBuckets, combinedOtherBucket]
            } else if (cutoffBucket) {
                editionData.buckets = [...mainBuckets, { ...cutoffBucket, id: OTHER_ANSWERS }]
            } else if (unmatchedBucket) {
                editionData.buckets = [
                    ...mainBuckets,
                    { ...unmatchedBucket, groupedBucketIds: [NO_MATCH], id: OTHER_ANSWERS }
                ]
            }
        }
    }
}
