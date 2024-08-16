import React from 'react'
import { RowSingle } from '../rows/RowSingle'
import { HorizontalBarViewDefinition } from '../types'
import { removeNoAnswer } from '../helpers/steps'
import { BucketUnits } from '@devographics/types'
import { RowGroup, Rows } from '../rows'
import { formatNumber } from 'core/charts/common2/helpers/format'

export const Count: HorizontalBarViewDefinition = {
    getValue: bucket => bucket[BucketUnits.COUNT] || 0,
    formatValue: formatNumber,
    dataFilters: [removeNoAnswer],
    component: props => {
        return (
            <Rows {...props} hasZebra={true}>
                {props.buckets.map((bucket, i) => (
                    <RowGroup
                        key={bucket.id}
                        bucket={bucket}
                        rowIndex={i}
                        {...props}
                        rowComponent={RowSingle}
                        showCount={false}
                    />
                ))}
            </Rows>
        )
    }
}
