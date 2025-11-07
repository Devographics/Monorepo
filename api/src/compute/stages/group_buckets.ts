import { Entity, FacetBucket, OptionGroup, Token } from '@devographics/types'
import { ResponseEditionData, ComputeAxisParameters, Bucket } from '../../types'
import { CATCHALL_PREFIX, NO_ANSWER } from '@devographics/constants'
import uniq from 'lodash/uniq.js'
import compact from 'lodash/compact.js'
import { mergeBuckets } from './mergeBuckets'
import { getEntity } from '../../load/entities'

const isInBounds = (n: number, lowerBound?: number, upperBound?: number) => {
    if (typeof lowerBound !== 'undefined' && typeof upperBound !== 'undefined') {
        return n >= lowerBound && n < upperBound
    } else if (typeof lowerBound !== 'undefined') {
        return n >= lowerBound
    } else if (typeof upperBound !== 'undefined') {
        return n < upperBound
    } else {
        throw new Error(`isInBounds: no bounds specified`)
    }
}

// group buckets based on predefined groups
async function getGroupedBuckets<T extends Bucket | FacetBucket>({
    groups,
    buckets,
    primaryAxis,
    secondaryAxis,
    isFacetBuckets
}: {
    groups: OptionGroup[]
    buckets: T[]
    primaryAxis: ComputeAxisParameters
    secondaryAxis?: ComputeAxisParameters
    isFacetBuckets?: boolean
}) {
    const noAnswerBucket = buckets.find(b => b.id === NO_ANSWER)
    // keep track of the ids of all buckets that got matched into a group
    let groupedBucketIds: string[] = []
    let groupedBuckets: T[] = []
    for (const group of groups) {
        const { id: groupId, upperBound, lowerBound, items } = group
        let selectedBuckets: T[]
        if (items) {
            selectedBuckets = buckets.filter(b => items.includes(b.id))
        } else if (typeof lowerBound !== 'undefined' || typeof upperBound !== 'undefined') {
            selectedBuckets = buckets.filter(b => isInBounds(Number(b.id), lowerBound, upperBound))
        } else {
            throw new Error(
                `groupBuckets: please specify lowerBound/upperBound or items array for group ${groupId}`
            )
        }

        groupedBucketIds = [...groupedBucketIds, ...selectedBuckets.map(b => b.id)]

        /*

        If there is an individual ungrouped bucket with the same id as a bucket group,
        transform it into a "catch-all" child bucket and add it to the group.

        For example, if we have a `styling_customization` token that becomes a group parent, 
        put all its matched elements into a `catchall_styling_customization` child token

        styling_customization
            - catchall_styling_customization ⬅️
            - styling_select_inputs
            - styling_date_pickers
            - ...
    
        NOTE: this breaks when a group has the same id as a bucket, for example if
        we want to create one group for `men` and one group for `women_and_non_b` in a situation
        where there is already a `men` bucket. 

        */

        const catchAllBucket = buckets.find(b => b.id === groupId)
        if (catchAllBucket) {
            groupedBucketIds.push(catchAllBucket.id)
            selectedBuckets = [
                ...selectedBuckets,
                { ...catchAllBucket, id: `${CATCHALL_PREFIX}${catchAllBucket.id}` }
            ]
        }

        // if created grouped bucket has associated entity/token, add them here
        const mergedProps: { id: string; entity?: Entity; token?: Token } = { id: groupId }
        const entity = await getEntity({ id: groupId })
        const token = await getEntity({ id: groupId, includeNormalizationEntities: true })

        if (entity) {
            mergedProps.entity = entity
        }
        if (token) {
            mergedProps.token = token
        }
        const bucket = mergeBuckets<T>({
            buckets: selectedBuckets,
            mergedProps,
            primaryAxis,
            secondaryAxis,
            isFacetBuckets
        })
        groupedBuckets.push(bucket)
    }

    // add any remaning buckets that were not matched into groups as standalone buckets
    // so that we don't lose any data
    let remainingUngroupedBuckets = buckets.filter(b => !groupedBucketIds.includes(b.id))

    groupedBuckets = noAnswerBucket
        ? [...groupedBuckets, ...remainingUngroupedBuckets, noAnswerBucket]
        : [...groupedBuckets, ...remainingUngroupedBuckets]
    return groupedBuckets
}

function getNestedBucketTree(buckets: Bucket[]): Bucket[] {
    const lookup = new Map<string, Bucket>()

    // First, create a node for every item
    for (const bucket of buckets) {
        lookup.set(bucket.id, { ...bucket, groupedBuckets: [] })
    }

    const roots: Bucket[] = []

    // Then, link children to their parents
    for (const bucket of buckets) {
        const node = lookup.get(bucket.id)!
        if (bucket.token?.parentId) {
            const parent = lookup.get(bucket.token.parentId)
            if (parent) {
                parent.groupedBuckets!.push(node)
            }
        } else {
            roots.push(node)
        }
    }

    // Recursively sort groupedBuckets by count, descending
    function sortAndPrune(nodes: Bucket[]) {
        for (const n of nodes) {
            if (n.groupedBuckets && n.groupedBuckets.length > 0) {
                // Sort descending by count
                n.groupedBuckets.sort((a, b) => (b.count ?? 0) - (a.count ?? 0))
                sortAndPrune(n.groupedBuckets)
            } else {
                delete n.groupedBuckets
            }
        }
    }

    sortAndPrune(roots)

    // Finally, sort the root level as well
    roots.sort((a, b) => (b.count ?? 0) - (a.count ?? 0))

    return roots
}

// not used

// function getParentIdGroups(buckets: Bucket[]): OptionGroup[] | undefined {
//     // get the ids of all the main parent buckets, if there are any defined
//     const parentIds = uniq(compact(buckets.map(b => b.token?.parentId)))

//     if (parentIds.length === 0) {
//         return
//     } else {
//         const parentIdGroups = parentIds.map(parentId => {
//             // define a group that contains all the buckets that
//             // have the current parentId as parentId
//             const items = buckets.filter(b => b.token?.parentId === parentId).map(b => b.id)
//             return {
//                 id: parentId,
//                 items
//             }
//         })
//         return parentIdGroups
//     }
// }

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
                bucket.facetBuckets = await getGroupedBuckets<FacetBucket>({
                    groups: axis2.question.groups,
                    buckets: bucket.facetBuckets,
                    primaryAxis: axis2,
                    isFacetBuckets: true
                })
            }
        }
        if (axis1.enableBucketGroups) {
            if (axis1.question.groups) {
                const groupedBuckets = await getGroupedBuckets<Bucket>({
                    groups: axis1.question.groups,
                    buckets: editionData.buckets,
                    primaryAxis: axis1,
                    secondaryAxis: axis2
                })
                editionData.buckets = groupedBuckets
            } else if (editionData.buckets.filter(b => b.token?.parentId).length > 0) {
                // if at least one bucket has a token with a parentId,
                // nest all buckets
                const nestedBuckets = getNestedBucketTree(editionData.buckets)
                editionData.buckets = nestedBuckets
            }
        }
    }
}
