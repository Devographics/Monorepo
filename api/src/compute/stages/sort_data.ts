import { ComputeAxisParameters, SortProperty, SortOrderNumeric } from '../../types'
import { ResponseEditionData, Bucket, FacetBucket, Option } from '@devographics/types'
import sortBy from 'lodash/sortBy.js'
import isEmpty from 'lodash/isEmpty.js'
import { NO_ANSWER, NO_MATCH } from '@devographics/constants'

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
    sortedBuckets = putNoMatchBucketLast<T>(sortedBuckets)
    sortedBuckets = putNoAnswerBucketLast<T>(sortedBuckets)
    return sortedBuckets
}

export function sortByOptions<T extends Bucket | FacetBucket>(buckets: T[], options: Option[]) {
    console.log('// sorting by option…')
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

// put no answer bucket last (if it exists)
export function putNoAnswerBucketLast<T extends Bucket | FacetBucket>(buckets: T[]) {
    const noAnswerBucket = buckets.find(b => b.id === NO_ANSWER) as T
    if (noAnswerBucket) {
        const regularBuckets = buckets.filter(b => b.id !== NO_ANSWER) as T[]
        return [...regularBuckets, noAnswerBucket]
    } else {
        return buckets
    }
}

// put no match bucket last (if it exists)
export function putNoMatchBucketLast<T extends Bucket | FacetBucket>(buckets: T[]) {
    const noMatchBucket = buckets.find(b => b.id === NO_MATCH) as T
    if (noMatchBucket) {
        const regularBuckets = buckets.filter(b => b.id !== NO_MATCH) as T[]
        return [...regularBuckets, noMatchBucket]
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
