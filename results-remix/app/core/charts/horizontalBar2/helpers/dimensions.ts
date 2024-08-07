import { FacetBucket } from '@devographics/types'
import { ChartState } from '../types'
import { getViewDefinition } from './views'
import take from 'lodash/take'
import sum from 'lodash/sum'
import { Dimension } from 'core/charts/multiItemsExperience/types'
import { Bucket } from '@devographics/types'
import { Views } from '../types'
import sumBy from 'lodash/sumBy'
import round from 'lodash/round'

export const getCellDimensions = ({
    facetBuckets,
    chartState
}: {
    facetBuckets: FacetBucket[]
    chartState: ChartState
}) => {
    const viewDefinition = getViewDefinition(chartState.view)
    const { getValue } = viewDefinition

    const dimensions: Dimension[] = facetBuckets.map((facetBucket, index) => {
        const value = getValue(facetBucket)

        // note: since there are no item gaps in this view, assume all items always
        // add up to 100% for now, so no ratio needs to be applied here
        const width = value
        const offset = round(
            sum(
                take(
                    facetBuckets.map(b => getValue(b)),
                    index
                )
            ),
            1
        )
        return { id: facetBucket.id, width, offset }
    })
    return dimensions
}

/*

Calculate how much to offset a row by to line up whichever column/cell the chart is sorted by

*/
export const getRowOffset = ({
    buckets,
    bucket,
    chartState
}: {
    buckets: Bucket[]
    bucket: Bucket
    chartState: ChartState
}) => {
    const { view, sort } = chartState
    const { getValue } = getViewDefinition(view)
    if (getValue && [Views.PERCENTAGE_BUCKET, Views.FACET_COUNTS].includes(view) && sort) {
        // check if a bucket contains the facet that we're currently sorting by
        const containsSortedFacet = (b: Bucket) => b.facetBuckets.some(fb => fb.id === sort)

        // only offset bucket if it actually contains whatever we're sorting by
        if (containsSortedFacet(bucket)) {
            const getOffset = (bucket: Bucket) => {
                const { facetBuckets } = bucket
                const currentFacetBucketIndex = facetBuckets.findIndex(fb => fb.id === sort)
                const previousFacetBuckets = take(facetBuckets, currentFacetBucketIndex)
                const valuesSum = sumBy(previousFacetBuckets, fb => getValue(fb))
                return valuesSum
            }
            // find the first bucket that has the value we're sorting by as a starting
            // point to calculate offsets
            const firstBucketWithFacet = buckets.find(containsSortedFacet)
            // only proceed if at least one bucket contains the facet we're sorting by
            if (firstBucketWithFacet) {
                const firstBucketOffset = getOffset(firstBucketWithFacet)
                const currentBucketOffset = getOffset(bucket)
                return round(currentBucketOffset - firstBucketOffset, 1)
            }
        }
    }
    return 0
}
