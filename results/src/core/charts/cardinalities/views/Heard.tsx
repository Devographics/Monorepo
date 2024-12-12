import React from 'react'
import { BucketUnits } from '@devographics/types'
import { formatPercentage, formatQuestionValue } from 'core/charts/common2/helpers/format'
import {
    HorizontalBarChartState,
    HorizontalBarViewDefinition
} from 'core/charts/horizontalBar2/types'
import { RowGroup, Rows, RowSingle } from 'core/charts/horizontalBar2/rows'

export const Heard: HorizontalBarViewDefinition<HorizontalBarChartState> = {
    getValue: bucket => bucket[BucketUnits.PERCENTAGE_SURVEY] || 0,
    formatValue: v => formatPercentage(v),
    component: props => {
        return (
            <Rows {...props}>
                {props.buckets.map((bucket, i) => (
                    <RowGroup
                        rowIndex={i}
                        key={bucket.id}
                        bucket={bucket}
                        {...props}
                        rowComponent={RowSingle}
                    />
                ))}
            </Rows>
        )
    }
}
