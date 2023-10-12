import { ComputeAxisParameters, SortProperty, SortOrderNumeric } from '../../types'
import { ResponseEditionData, Bucket, FacetBucket, Option } from '@devographics/types'
import sortBy from 'lodash/sortBy.js'
import isEmpty from 'lodash/isEmpty.js'
// import { NO_ANSWER } from '@devographics/constants'
const NO_ANSWER = 'no_answer'

export function sortBuckets<T extends Bucket | FacetBucket>(
    buckets: T[],
    axis: ComputeAxisParameters
) {
    const { sort, order, options } = axis
    let sortedBuckets = [...buckets]
    if (sort === 'options') {
        if (options && !isEmpty(options)) {
            // if values are specified, sort by values
            sortedBuckets = sortByOptions(sortedBuckets, options)
        }
    } else {
        sortedBuckets = sortByProperty(sortedBuckets, sort, order)
    }
    sortedBuckets = putNoAnswerBucketLast<T>(sortedBuckets)
    return sortedBuckets
}

export function sortByOptions<T extends Bucket | FacetBucket>(buckets: T[], options: Option[]) {
    return [...buckets].sort((a, b) => {
        // make sure everything is a string to avoid type mismatches
        const stringValues = options.map(o => o.id.toString())
        const indexA = stringValues.indexOf(a.id.toString())
        const indexB = stringValues.indexOf(b.id.toString())
        // if an item doesn't have a corresponding option, make sure it's sorted last
        // (will happen for combined results)
        return indexA === -1 ? 99999 : indexA - indexB
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

// put on answer bucket last (if it exists)
export function putNoAnswerBucketLast<T extends Bucket | FacetBucket>(buckets: T[]) {
    const noAnswerBucket = buckets.find(b => b.id === NO_ANSWER) as T
    if (noAnswerBucket) {
        const regularBuckets = buckets.filter(b => b.id !== NO_ANSWER) as T[]
        return [...regularBuckets, noAnswerBucket]
    } else {
        return buckets
    }
}

export async function sortData(
    resultsByEdition: ResponseEditionData[],
    axis1: ComputeAxisParameters,
    axis2?: ComputeAxisParameters
) {
    for (let editionData of resultsByEdition) {
        // first, sort regular buckets
        editionData.buckets = sortBuckets<Bucket>(editionData.buckets, axis1)

        if (axis2) {
            // then, sort facetBuckets if they exist
            for (let bucket of editionData.buckets) {
                bucket.facetBuckets = sortBuckets<FacetBucket>(bucket.facetBuckets, axis2)
            }
        }
    }
}
