import React from 'react'
import { RowStacked } from '../rows/RowStacked'
import { HorizontalBarViewDefinition } from '../types'
import { removeNoAnswer, removeOverall } from '../helpers/steps'
import { BucketUnits } from '@devographics/types'
import { RowGroup, Rows } from '../rows'
import { formatNumber } from 'core/charts/common2/helpers/labels'

export const FacetCounts: HorizontalBarViewDefinition = {
    getValue: facetBucket => facetBucket[BucketUnits.COUNT] || 0,
    formatValue: formatNumber,
    dataFilters: [removeOverall, removeNoAnswer],
    showLegend: true,
    component: props => {
        return (
            <Rows {...props}>
                {props.buckets.map((bucket, i) => (
                    <RowGroup
                        key={bucket.id}
                        bucket={bucket}
                        rowIndex={i}
                        {...props}
                        rowComponent={RowStacked}
                    />
                ))}
            </Rows>
        )
    }
}
