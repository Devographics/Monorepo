import React from 'react'
import { RowSingle } from '../rows/RowSingle'
import { HorizontalBarChartState, HorizontalBarViewDefinition } from '../types'
import { removeNoAnswer, removeNotApplicable } from '../helpers/steps'
import { BucketUnits } from '@devographics/types'
import { RowGroup, Rows } from '../rows'
import { formatQuestionValue } from 'core/charts/common2/helpers/format'

export const Average: HorizontalBarViewDefinition<HorizontalBarChartState> = {
    getValue: bucket => bucket[BucketUnits.AVERAGE] || 0,
    formatValue: formatQuestionValue,
    dataFilters: [removeNotApplicable, removeNoAnswer],
    component: props => {
        return (
            <Rows {...props}>
                {props.buckets.map((bucket, i) => (
                    <RowGroup
                        rowIndex={i}
                        key={bucket.id}
                        bucket={bucket}
                        rowComponent={RowSingle}
                        {...props}
                    />
                ))}
            </Rows>
        )
    }
}
