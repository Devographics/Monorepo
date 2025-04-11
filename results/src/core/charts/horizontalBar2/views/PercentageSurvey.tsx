import React from 'react'
import { HorizontalBarViewDefinition } from '../types'
import { removeNoAnswer } from '../helpers/steps'
import { Bucket, BucketUnits, FacetBucket } from '@devographics/types'
import round from 'lodash/round'
import { RowSingle } from '../rows/RowSingle'
import { RowGroup, Rows } from '../rows'
import { formatPercentage } from 'core/charts/common2/helpers/format'
import { AverageMarker } from '../rows/AverageMarker'

const getValue = (bucket: Bucket | FacetBucket) => bucket[BucketUnits.PERCENTAGE_SURVEY] || 0

export const getTicks = (maxValue?: number) => {
    const NUMBER_OF_TICKS = 5
    const ticks = [...Array(NUMBER_OF_TICKS + 1)].map(
        (a, i) => ({ value: round((i * (maxValue || 0)) / NUMBER_OF_TICKS) }),
        1
    )
    return ticks
}

const dataFilters = [
    // removeNoAnswer
    // removeOverLimit,
    // removeUnderCutoff,
    // removeOtherAnswers
]

export const PercentageSurvey: HorizontalBarViewDefinition = {
    getValue,
    formatValue: formatPercentage,
    getTicks,
    dataFilters,
    component: props => {
        return (
            <Rows {...props} labelId="charts.axis_legends.users_percentage_survey" hasZebra={true}>
                <AverageMarker {...props} />
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
