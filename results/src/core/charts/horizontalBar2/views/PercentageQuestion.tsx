import React from 'react'
import { SingleBarRow } from '../HorizontalBarRow'
import { ViewDefinition } from '../types'
import { Row, Rows, getTicks } from 'core/charts/common2'
import { removeNoAnswer, removeOverLimit, removeOtherAnswers } from '../helpers/steps'
import { Bucket, BucketUnits, FacetBucket } from '@devographics/types'

const getValue = (bucket: Bucket | FacetBucket) => bucket[BucketUnits.PERCENTAGE_QUESTION] || 0

export const PercentageQuestion: ViewDefinition = {
    getValue,
    steps: [removeNoAnswer, removeOverLimit, removeOtherAnswers],
    component: props => {
        const ticks = getTicks(props.buckets.map(getValue))
        return (
            <Rows
                {...props}
                ticks={ticks}
                formatValue={t => `${t}%`}
                labelId="charts.axis_legends.users_percentage_question"
                hasZebra={true}
            >
                {props.buckets.map((bucket, i) => (
                    <Row
                        key={bucket.id}
                        ticks={ticks}
                        bucket={bucket}
                        rowComponent={SingleBarRow}
                        {...props}
                    />
                ))}
            </Rows>
        )
    }
}
