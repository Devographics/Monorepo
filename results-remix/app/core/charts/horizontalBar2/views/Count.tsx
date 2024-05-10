import React from 'react'
import { SingleBarRow } from '../HorizontalBarRow'
import { ViewDefinition } from '../types'
import { Row, Rows } from 'core/charts/common2'
import { removeNoAnswer } from '../helpers/steps'
import { BucketUnits } from '@devographics/types'

export const Count: ViewDefinition = {
    getValue: bucket => bucket[BucketUnits.COUNT] || 0,
    steps: [removeNoAnswer],
    component: props => {
        return (
            <Rows {...props}>
                {props.buckets.map((bucket, i) => (
                    <Row key={bucket.id} bucket={bucket} {...props} rowComponent={SingleBarRow} />
                ))}
            </Rows>
        )
    }
}
