import React from 'react'
import { SingleBarRow } from '../HorizontalBarRow'
import { ViewDefinition } from '../types'
import { Row, Rows } from 'core/charts/common2'
import { removeNoAnswer } from '../helpers/steps'
import { BucketUnits } from '@devographics/types'

export const PercentageQuestion: ViewDefinition = {
    getValue: bucket => bucket[BucketUnits.PERCENTAGE_QUESTION] || 0,
    steps: [removeNoAnswer],
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
