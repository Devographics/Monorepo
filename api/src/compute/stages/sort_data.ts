import { ComputeAxisParameters, SortOrderNumeric } from '../../types'
import { ResponseEditionData, Bucket, FacetBucket, SortProperty } from '@devographics/types'
import sortBy from 'lodash/sortBy.js'
import isEmpty from 'lodash/isEmpty.js'
import {
    CUTOFF_ANSWERS,
    INSUFFICIENT_DATA,
    NOT_APPLICABLE,
    NO_ANSWER,
    NO_MATCH,
    OTHER_ANSWERS
} from '@devographics/constants'

/*

Get the axis's groups when bucket grouping is enabled, or its options otherwise.

Use this for anything that runs on buckets *after* the groupBuckets stage. Note that
group buckets keep their children (`groupedBuckets`) which still use option ids, so
anything looking up a single option (e.g. its average) should keep using `axis.options`.

*/
export const getAxisOptionsOrGroups = (axis?: ComputeAxisParameters) =>
    axis?.enableBucketGroups && axis?.question.groups ? axis.question.groups : axis?.options

export function sortBuckets<T extends Bucket | FacetBucket>(
    buckets: T[],
    axis: ComputeAxisParameters
) {
    const { sort, order, options } = axis
    let sortedBuckets = [...buckets]
    if (sort === 'options') {
        // buckets can be groups (after the groupBuckets stage), options (the children
        // of a group, or buckets that didn't match any group), or a mix of both
        const groups = axis.enableBucketGroups ? axis.question.groups : undefined
        const sortOrder = [...(groups ?? []), ...(options ?? [])]
        if (!isEmpty(sortOrder)) {
            // if values are specified, sort by values
            sortedBuckets = sortByOptions(sortedBuckets, sortOrder)
        }
    } else {
        sortedBuckets = sortByProperty(sortedBuckets, sort, order)
    }
    sortedBuckets = putBucketLast<T>(sortedBuckets, CUTOFF_ANSWERS)
    sortedBuckets = putBucketLast<T>(sortedBuckets, NO_MATCH)
    sortedBuckets = putBucketLast<T>(sortedBuckets, OTHER_ANSWERS)
    // NOT_APPLICABLE is an actual answer so don't put it last
    // sortedBuckets = putBucketLast<T>(sortedBuckets, NOT_APPLICABLE)
    sortedBuckets = putBucketLast<T>(sortedBuckets, NO_ANSWER)
    sortedBuckets = putBucketLast<T>(sortedBuckets, INSUFFICIENT_DATA)
    return sortedBuckets
}

export function sortByOptions<T extends Bucket | FacetBucket>(
    buckets: T[],
    options: Array<{ id: string | number }>
) {
    return [...buckets].sort((a, b) => {
        // make sure everything is a string to avoid type mismatches
        const stringValues = options.map(o => o.id.toString())
        const indexA = stringValues.indexOf(a.id.toString())
        const indexB = stringValues.indexOf(b.id.toString())
        // if an item doesn't have a corresponding option, make sure it's sorted last
        // (will happen for combined results or no_answer bucket)
        let sortIndicator
        if (indexA === -1) {
            // a value is not in options, assume that a > b
            sortIndicator = 1
        } else if (indexB === -1) {
            // b value is not in options, assume that a < b
            sortIndicator = -1
        } else {
            sortIndicator = indexA - indexB
        }
        // console.log(sortIndicator > 0 ? `${a.id} > ${b.id}` : `${a.id} < ${b.id}`)
        return sortIndicator
    })
}

export function sortByProperty<T extends Bucket | FacetBucket>(
    buckets: T[],
    sortProperty: SortProperty,
    sortOrder: SortOrderNumeric
) {
    let sortedBuckets = [...buckets]
    // start with an alphabetical sort to ensure a stable
    // sort even when multiple items have same count
    sortedBuckets = sortBy(sortedBuckets, 'id')
    // sort by sort/order
    if (sortOrder === -1) {
        // reverse first so that ids end up in right order when we reverse again
        sortedBuckets.reverse()
        sortedBuckets = sortBy(sortedBuckets, sortProperty)
        sortedBuckets.reverse()
    } else {
        sortedBuckets = sortBy(sortedBuckets, sortProperty)
    }
    return sortedBuckets
}

// move a bucket to the bottom
export function putBucketLast<T extends Bucket | FacetBucket>(buckets: T[], bucketId: string) {
    const lastBucket = buckets.find(b => b.id === bucketId) as T
    if (lastBucket) {
        const regularBuckets = buckets.filter(b => b.id !== bucketId) as T[]
        return [...regularBuckets, lastBucket]
    } else {
        return buckets
    }
}

export function sortBucketsAndFacets(
    buckets: Bucket[],
    axis1: ComputeAxisParameters,
    axis2?: ComputeAxisParameters
) {
    // first, sort regular buckets
    const sortedBuckets = sortBuckets<Bucket>(buckets, axis1)

    if (axis2) {
        // then, sort facetBuckets if they exist
        for (let bucket of sortedBuckets) {
            bucket.facetBuckets = sortBuckets<FacetBucket>(bucket.facetBuckets, axis2)
        }
    }
    return sortedBuckets
}

export async function sortData(
    resultsByEdition: ResponseEditionData[],
    axis1: ComputeAxisParameters,
    axis2?: ComputeAxisParameters
) {
    for (let editionData of resultsByEdition) {
        editionData.buckets = sortBucketsAndFacets(editionData.buckets, axis1, axis2)
    }
}
