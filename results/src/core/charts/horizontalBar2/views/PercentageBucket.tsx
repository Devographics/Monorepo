import React from 'react'
import { RowStacked } from '../rows/RowStacked'
import { HorizontalBarChartState, HorizontalBarViewDefinition } from '../types'
import { removeNoAnswer, removeOtherAnswers, removeOverLimit } from '../helpers/steps'
import { BucketUnits, FacetBucket } from '@devographics/types'
import { getCellDimensions, getRowOffset } from '../helpers/dimensions'
import min from 'lodash/min'
import max from 'lodash/max'
import { applyRatio } from 'core/charts/multiItemsExperience/helpers/helpers'
import { Dimension } from 'core/charts/multiItemsExperience/types'
import { RowGroup, Rows } from '../rows'
import { formatPercentage } from 'core/charts/common2/helpers/format'

const getValue = (facetBucket: FacetBucket) => facetBucket[BucketUnits.PERCENTAGE_BUCKET] || 0

export const PercentageBucket: HorizontalBarViewDefinition<HorizontalBarChartState> = {
    getValue,
    formatValue: formatPercentage,
    getTicks: () => [
        { value: 0 },
        { value: 20 },
        { value: 40 },
        { value: 60 },
        { value: 80 },
        { value: 100 }
    ],
    dataFilters: [removeNoAnswer, removeOverLimit, removeOtherAnswers],
    showLegend: true,
    component: props => {
        const { buckets, chartState } = props
        let allRowsCellDimensions = buckets.map(bucket => {
            const { facetBuckets } = bucket
            if (facetBuckets) {
                return getCellDimensions({
                    facetBuckets,
                    chartState
                })
            } else {
                return [{ width: 100, offset: 0 }] as Dimension[]
            }
        })

        let allRowsOffsets = buckets.map(bucket =>
            getRowOffset({
                buckets,
                bucket,
                chartState
            })
        )

        // offseting row will make the entire chart expand past 100%
        // shrink it down to 100% again
        // note: offsets can be positive (offset to the left) or negative (offset to the right)
        const largestNegativeOffset = min(allRowsOffsets.filter(o => o < 0)) || 0
        const largestPositiveOffset = max(allRowsOffsets.filter(o => o > 0)) || 0

        const totalWidthWithOffset = Math.abs(largestNegativeOffset) + largestPositiveOffset + 100

        const rowOffsetShrinkRatio = 100 / totalWidthWithOffset
        allRowsCellDimensions = allRowsCellDimensions.map(cd =>
            applyRatio<Dimension>(cd, rowOffsetShrinkRatio)
        )
        // note: up to now we have only calculated offsets relative to the first row
        // but the first row may itself need to be offseted. In this case
        // subract additional largestPositiveOffset to all offsets
        allRowsOffsets = allRowsOffsets.map(rowOffset => rowOffset - largestPositiveOffset)
        // finally, apply shrinking ratio
        allRowsOffsets = allRowsOffsets.map(rowOffset => rowOffset * rowOffsetShrinkRatio)

        return (
            <Rows {...props} labelId="charts.axis_legends.users_percentageBucket" hasZebra={true}>
                {props.buckets.map((bucket, i) => (
                    <RowGroup
                        key={bucket.id}
                        bucket={bucket}
                        {...props}
                        rowComponent={RowStacked}
                        rowIndex={i}
                        allRowsCellDimensions={allRowsCellDimensions}
                        allRowsOffsets={allRowsOffsets}
                    />
                ))}
            </Rows>
        )
    }
}
