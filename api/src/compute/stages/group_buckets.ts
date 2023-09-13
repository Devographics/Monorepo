import { BucketData, BucketUnits, FacetBucket, Option, OptionId } from '@devographics/types'
import { ResponseEditionData, ComputeAxisParameters, Bucket } from '../../types'
import sumBy from 'lodash/sumBy.js'

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
const combineFacetBuckets = (
    selectedBuckets: Bucket[],
    axis?: ComputeAxisParameters
): FacetBucket[] => {
    if (!axis?.options) {
        return []
    }
    const combinedFacetBuckets = axis.options.map(option => {
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
        return n >= lowerBound && n <= upperBound
    } else if (lowerBound) {
        return n >= lowerBound
    } else if (upperBound) {
        return n <= upperBound
    } else {
        throw new Error(`isInBounds: no bounds specified`)
    }
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
        if (axis1.question.groups) {
            const groupedBuckets = axis1.question.groups.map(group => {
                const { id, upperBound, lowerBound, items } = group
                let selectedBuckets
                if (lowerBound || upperBound) {
                    selectedBuckets = editionData.buckets.filter(b =>
                        isInBounds(Number(b.id), lowerBound, upperBound)
                    )
                } else if (items) {
                    selectedBuckets = editionData.buckets.filter(b => items.includes(b.id))
                } else {
                    throw new Error(
                        `groupBuckets: please specify lowerBound/upperBound or items array for group ${id}`
                    )
                }

                const facetBuckets = combineFacetBuckets(selectedBuckets, axis2)

                const bucket = {
                    id,
                    count: sumBy(selectedBuckets, 'count'),
                    percentageSurvey:
                        Math.round(100 * sumBy(selectedBuckets, 'percentageSurvey')) / 100,
                    percentageQuestion:
                        Math.round(100 * sumBy(selectedBuckets, 'percentageQuestion')) / 100,
                    facetBuckets
                }

                return bucket
            })
            editionData.buckets = groupedBuckets
        }
    }
}
