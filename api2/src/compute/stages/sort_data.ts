import {
    EditionData,
    ComputeAxisParameters,
    SortProperty,
    SortOrderNumeric,
    Bucket,
    FacetBucket
} from '../../types'
import sortBy from 'lodash/sortBy.js'
import isEmpty from 'lodash/isEmpty.js'

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
    return sortedBuckets
}

export function sortByOptions<T extends Bucket | FacetBucket>(buckets: T[], options: string[]) {
    return [...buckets].sort((a, b) => {
        // make sure everything is a string to avoid type mismatches
        const stringValues = options.map(v => v.toString())
        return stringValues.indexOf(a.id.toString()) - stringValues.indexOf(b.id.toString())
    })
}

export function sortByProperty<T extends Bucket | FacetBucket>(
    buckets: T[],
    sortProperty: SortProperty,
    sortOrder: SortOrderNumeric
) {
    console.log('// sortProperty')
    console.log(sortProperty)
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

export async function sortData(
    resultsByEdition: EditionData[],
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
