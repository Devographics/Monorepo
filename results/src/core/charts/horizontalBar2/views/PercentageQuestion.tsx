import React from 'react'
import { HorizontalBarViewDefinition } from '../types'
import {
    removeNoAnswer,
    removeOverLimit,
    removeOtherAnswers,
    removeUnderCutoff
} from '../helpers/steps'
import { Bucket, BucketUnits, FacetBucket } from '@devographics/types'
import max from 'lodash/max'
import round from 'lodash/round'
import { RowSingle } from '../rows/RowSingle'
import { RowGroup, Rows } from '../rows'
import { formatPercentage } from 'core/charts/common2/helpers/labels'

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

const dataFilters = [
    // foo,
    removeNoAnswer
    // removeOverLimit,
    // removeUnderCutoff,
    // removeOtherAnswers
]

export const PercentageQuestion: HorizontalBarViewDefinition = {
    getValue,
    formatValue: formatPercentage,
    getTicks,
    dataFilters,
    component: props => {
        return (
            <Rows
                {...props}
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
