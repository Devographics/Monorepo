import { ResponseEditionData, ComputeAxisParameters, Bucket } from '../../types'

function getNestedBucketTree(buckets: Bucket[]): Bucket[] {
    const lookup = new Map<string, Bucket>()

    // First, create a node for every item
    for (const bucket of buckets) {
        lookup.set(bucket.id, { ...bucket, nestedBuckets: [] })
    }

    const roots: Bucket[] = []

    // Then, link children to their parents
    for (const bucket of buckets) {
        const node = lookup.get(bucket.id)!
        const parentId = bucket.token?.parentId
        const parent = parentId && lookup.get(parentId)
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
    resultsByEdition: ResponseEditionData[],
    axis1: ComputeAxisParameters,
    axis2?: ComputeAxisParameters
) {
    for (let editionData of resultsByEdition) {
        if (axis1.enableBucketNesting) {
            const nestedBuckets = getNestedBucketTree(editionData.buckets)
            editionData.buckets = nestedBuckets
        }
    }
}
