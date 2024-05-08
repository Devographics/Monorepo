import { Entity, FacetBucket, OptionGroup, Token } from '@devographics/types'
import { ResponseEditionData, ComputeAxisParameters, Bucket } from '../../types'
import { NO_ANSWER } from '@devographics/constants'
import uniq from 'lodash/uniq.js'
import compact from 'lodash/compact.js'
import { mergeBuckets } from './mergeBuckets'
import { getEntity } from '../../load/entities'

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
        if (lowerBound || upperBound) {
            selectedBuckets = buckets.filter(b => isInBounds(Number(b.id), lowerBound, upperBound))
        } else if (items) {
            selectedBuckets = buckets.filter(b => items.includes(b.id))
        } else {
            throw new Error(
                `groupBuckets: please specify lowerBound/upperBound or items array for group ${groupId}`
            )
        }

        groupedBucketIds = [...groupedBucketIds, ...selectedBuckets.map(b => b.id)]

        // if there is an individual ungrouped bucket with the same id as a bucket group,
        // transform it into a "catch-all" child bucket and add it to the group
        const catchAllBucket = buckets.find(b => b.id === groupId)
        if (catchAllBucket) {
            groupedBucketIds.push(catchAllBucket.id)
            selectedBuckets = [
                ...selectedBuckets,
                { ...catchAllBucket, id: `catchall_${catchAllBucket.id}` }
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
                bucket.facetBuckets = await getGroupedBuckets<FacetBucket>({
                    groups: axis2.question.groups,
                    buckets: bucket.facetBuckets,
                    primaryAxis: axis2,
                    isFacetBuckets: true
                })
            }
        }
        if (axis1.enableBucketGroups) {
            const groups = axis1.question.groups || getParentIdGroups(editionData.buckets)
            if (groups) {
                const groupedBuckets = await getGroupedBuckets<Bucket>({
                    groups,
                    buckets: editionData.buckets,
                    primaryAxis: axis1,
                    secondaryAxis: axis2
                })
                editionData.buckets = groupedBuckets
            }
        }
    }
}
