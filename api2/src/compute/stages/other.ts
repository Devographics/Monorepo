import { EditionData } from '../../types'
import isEmpty from 'lodash/isEmpty.js'

/*

Discard any result where id is {}, "", [], etc. 

*/
export async function discardEmptyIds(resultsByEdition: EditionData[]) {
    for (let editionData of resultsByEdition) {
        editionData.buckets = editionData.buckets.filter(
            b => typeof b.id === 'number' || !isEmpty(b.id)
        )
        for (let bucket of editionData.buckets) {
            if (bucket.facetBuckets) {
                bucket.facetBuckets = bucket.facetBuckets.filter(
                    b => typeof b.id === 'number' || !isEmpty(b.id)
                )
            }
        }
    }
}
