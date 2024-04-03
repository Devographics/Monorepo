import React from 'react'
import { SingleBarRow } from '../HorizontalBarRow'
import { ViewDefinition } from '../types'
import { Axis, Row, Rows, getTicks } from 'core/charts/common2'
import { removeNoAnswer } from '../helpers/steps'
import { Bucket, BucketUnits, FacetBucket } from '@devographics/types'

const getValue = (bucket: Bucket | FacetBucket) => bucket[BucketUnits.PERCENTAGE_QUESTION] || 0

export const PercentageQuestion: ViewDefinition = {
    getValue,
    steps: [removeNoAnswer],
    component: props => {
        return (
            <Rows
                ticks={getTicks(props.buckets.map(getValue))}
                formatValue={t => `${t}%`}
                labelId="charts.axis_legends.users_percentage_question"
            >
                {props.buckets.map((bucket, i) => (
                    <Row key={bucket.id} bucket={bucket} {...props} rowComponent={SingleBarRow} />
                ))}
            </Rows>
        )
    }
}
