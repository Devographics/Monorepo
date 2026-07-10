import { Entity } from '@devographics/types'
import { ResponseEditionData, ComputeAxisParameters, Bucket, RequestContext } from '../../types'
import { getEntities } from '../../load/entities'

function getNestedBucketTree(
    buckets: Bucket[],
    entities: Entity[],
    disallowedTokenIds: string[] = []
): Bucket[] {
    const lookup = new Map<string, Bucket>()

    // First, create a node for every item
    for (const bucket of buckets) {
        lookup.set(bucket.id, { ...bucket, nestedBuckets: [] })
    }

    const entityLookup = new Map<string, Entity>()
    for (const entity of entities) {
        if (!disallowedTokenIds.includes(entity.id)) {
            entityLookup.set(entity.id, entity)
        }
    }

    /*

    Walk up the parentId chain (via entities) starting from parentId itself,
    and return the first ancestor that actually exists as a bucket. This way a
    bucket can be nested under e.g. its grandparent when its direct parent
    has no bucket in the dataset.

    */
    function findAncestorBucket(node: Bucket, parentId: string | undefined) {
        const visited = new Set<string>()
        let ancestorId = parentId
        while (ancestorId && !visited.has(ancestorId)) {
            visited.add(ancestorId)
            const ancestor = lookup.get(ancestorId)
            // guard against a bucket being its own ancestor
            if (ancestor && ancestor !== node) {
                return ancestor
            }
            ancestorId = entityLookup.get(ancestorId)?.parentId
        }
        return undefined
    }

    const roots: Bucket[] = []

    // Then, link children to their parents (or closest existing ancestor)
    for (const bucket of buckets) {
        const node = lookup.get(bucket.id)!
        const parentId = bucket.token?.parentId ?? entityLookup.get(bucket.id)?.parentId
        const parent = findAncestorBucket(node, parentId)
        if (parent) {
            parent.nestedBuckets!.push(node)
        } else {
            roots.push(node)
        }
    }

    // Recursively sort nestedBuckets by count, descending
    function sortAndPrune(nodes: Bucket[]) {
        for (const n of nodes) {
            if (n.nestedBuckets && n.nestedBuckets.length > 0) {
                // Sort descending by count
                n.nestedBuckets.sort((a, b) => (b.count ?? 0) - (a.count ?? 0))
                sortAndPrune(n.nestedBuckets)
            } else {
                delete n.nestedBuckets
            }
        }
    }

    sortAndPrune(roots)

    // Finally, sort the root level as well
    roots.sort((a, b) => (b.count ?? 0) - (a.count ?? 0))

    return roots
}

/*

Take a list of groups and group the buckets in each edition dataset
according to those groups, either based on lower/upper bounds; 
or on a preset list of ids. 

*/
export async function nestBuckets(
    context: RequestContext,
    resultsByEdition: ResponseEditionData[],
    axis1: ComputeAxisParameters,
    axis2?: ComputeAxisParameters
) {
    const entities = await getEntities({ context, includeNormalizationEntities: true })
    const disallowedTokenIds = axis1?.question?.disallowedTokenIds
    for (let editionData of resultsByEdition) {
        if (axis1.enableBucketNesting) {
            const nestedBuckets = getNestedBucketTree(
                editionData.buckets,
                entities,
                disallowedTokenIds
            )
            editionData.buckets = nestedBuckets
        }
    }
}
