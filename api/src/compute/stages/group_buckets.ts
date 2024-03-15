import { FacetBucket, OptionGroup, ParentIdGroup } from '@devographics/types'
import { ResponseEditionData, ComputeAxisParameters, Bucket } from '../../types'
import sumBy from 'lodash/sumBy.js'
import { CUTOFF_ANSWERS, NO_ANSWER, NO_MATCH, OTHER_ANSWERS } from '@devographics/constants'
import round from 'lodash/round.js'
import uniq from 'lodash/uniq.js'
import compact from 'lodash/compact.js'

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
    const noAnswerOption = { id: NO_ANSWER, label: NO_ANSWER }

    let combinedFacetBuckets = compact(
        [...optionsOrGroups, noAnswerOption].map(option => {
            const { id, label } = option
            // for each facet, find the equivalent facetBuckets in all the main buckets
            // make sure to compact to remove undefined facetBuckets (when the equivalent
            // facetBucket doesn't exist in another main bucket)
            const sameFacetBuckets = compact(
                selectedBuckets.map(b => b?.facetBuckets?.find(fb => fb.id === option.id)!)
            )
            // if the current/option we're considering doen't have any matching facet buckets
            // across all buckets, return undefined to get rid of it
            if (sameFacetBuckets.length === 0) {
                return
            }
            let combinedFacetBucket: FacetBucket = {
                // Note: might create issues when option ID is not the same as facet bucket ID
                id: String(id),
                label,
                count: round(
                    sumBy(sameFacetBuckets, b => b?.count ?? 0),
                    2
                )
            }
            // if the facets we're grouping all have groups, also combine the groups
            if (sameFacetBuckets.every(b => b.groupedBuckets)) {
                const groupedBuckets = uniq(sameFacetBuckets.map(b => b.groupedBuckets!).flat())
                const groupedBucketIds = groupedBuckets.map(b => b.id)
                combinedFacetBucket = {
                    ...combinedFacetBucket,
                    groupedBuckets,
                    groupedBucketIds
                }
            }

            return combinedFacetBucket
        })
    )
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
        percentageQuestion: round(sumBy(buckets, 'percentageQuestion'), 2),
        percentageSurvey: round(sumBy(buckets, 'percentageSurvey'), 2),
        groupedBuckets: buckets as unknown,
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
    // keep track of the ids of all buckets that got matched into a group
    let groupedBucketIds: string[] = []
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
        groupedBucketIds = [...groupedBucketIds, ...selectedBuckets.map(b => b.id)]
        const bucket = getMergedBucket<T>(selectedBuckets, id, axis)
        return bucket
    })

    // add any remaning buckets that were not matched into groups as standalone buckets
    // so that we don't lose any data
    const remainingUngroupedBuckets = buckets.filter(b => !groupedBucketIds.includes(b.id))

    groupedBuckets = noAnswerBucket
        ? [...groupedBuckets, ...remainingUngroupedBuckets, noAnswerBucket]
        : [...groupedBuckets, ...remainingUngroupedBuckets]
    return groupedBuckets
}

function getParentIdGroups(buckets: Bucket[]): OptionGroup[] | undefined {
    // get the ids of all the main parent buckets, if there are any defined
    const parentIds = uniq(compact(buckets.map(b => b.token?.parentId)))

    if (parentIds.length === 0) {
        return
    } else {
        const parentIdGroups = parentIds.map(parentId => {
            // define a group that contains all the buckets that
            // have the current parentId as parentId
            const items = buckets.filter(b => b.token?.parentId === parentId).map(b => b.id)
            return {
                id: parentId,
                items
            }
        })
        return parentIdGroups
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
        if (axis2 && axis2.enableBucketGroups && axis2.question.groups) {
            // first, group facetBuckets if needed
            for (let bucket of editionData.buckets) {
                bucket.facetBuckets = getGroupedBuckets<FacetBucket>({
                    groups: axis2.question.groups,
                    buckets: bucket.facetBuckets
                })
            }
        }
        if (axis1.enableBucketGroups) {
            const groups = axis1.question.groups || getParentIdGroups(editionData.buckets)
            if (groups) {
                const groupedBuckets = getGroupedBuckets<Bucket>({
                    groups,
                    buckets: editionData.buckets,
                    axis: axis2
                })
                editionData.buckets = groupedBuckets
            }
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
