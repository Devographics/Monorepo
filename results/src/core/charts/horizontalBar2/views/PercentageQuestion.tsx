import React from 'react'
import { HorizontalBarViewDefinition } from '../types'
import { removeNoAnswer, removeOverLimit, removeOtherAnswers } from '../helpers/steps'
import { Bucket, BucketUnits, FacetBucket } from '@devographics/types'
import max from 'lodash/max'
import round from 'lodash/round'
import { RowSingle } from '../rows/RowSingle'
import { RowGroup, Rows } from '../rows'

const getValue = (bucket: Bucket | FacetBucket) => bucket[BucketUnits.PERCENTAGE_QUESTION] || 0

const getTicks = (values: number[]) => {
    const NUMBER_OF_TICKS = 5
    const maxValue = max(values) || 0
    const ticks = [...Array(NUMBER_OF_TICKS + 1)].map(
        (a, i) => ({ value: round((i * maxValue) / NUMBER_OF_TICKS) }),
        1
    )
    return ticks
}

export const PercentageQuestion: HorizontalBarViewDefinition = {
    getValue,
    getTicks,
    dataFilters: [removeNoAnswer, removeOverLimit, removeOtherAnswers],
    component: props => {
        return (
            <Rows
                {...props}
                formatValue={t => `${t}%`}
                labelId="charts.axis_legends.users_percentage_question"
                hasZebra={true}
            >
                {props.buckets.map((bucket, i) => (
                    <RowGroup
                        key={bucket.id}
                        bucket={bucket}
                        rowComponent={RowSingle}
                        rowIndex={i}
                        {...props}
                    />
                ))}
            </Rows>
        )
    }
}
