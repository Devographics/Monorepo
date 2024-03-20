import React from 'react'
import { SingleBarRow } from '../HorizontalBarRow'
import { ViewDefinition } from '../types'
import { Row, Rows } from 'core/charts/common2'
import { removeNoAnswer, removeNotApplicable } from '../helpers/steps'
import { BucketUnits } from '@devographics/types'

export const Average: ViewDefinition = {
    getValue: bucket => bucket[BucketUnits.AVERAGE] || 0,
    steps: [removeNotApplicable, removeNoAnswer],
    component: props => {
        return (
            <Rows>
                {props.buckets.map((bucket, i) => (
                    <Row key={bucket.id} bucket={bucket} {...props} rowComponent={SingleBarRow} />
                ))}
            </Rows>
        )
    }
}
