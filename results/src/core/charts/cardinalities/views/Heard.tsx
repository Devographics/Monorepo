import React from 'react'
import { BucketUnits } from '@devographics/types'
import { formatPercentage } from 'core/charts/common2/helpers/format'
import { RowGroup, Rows, RowSingle } from 'core/charts/horizontalBar2/rows'
import { CardinalitiesViewDefinition } from '../types'
import { getTicks } from 'core/charts/horizontalBar2/views'

/*

We use PERCENTAGE_QUESTION here even though there is no 
cardinality "question".

This is because PERCENTAGE_SURVEY is not relative and doesn't adjust
when a filter is applied. 

When no filter is applied, PERCENTAGE_QUESTION and PERCENTAGE_SURVEY
will be the same anyway. 

Note: for ease of comprehension the label still says "% of survey respondents"

*/
export const Heard: CardinalitiesViewDefinition = {
    getValue: bucket => bucket[BucketUnits.PERCENTAGE_QUESTION] || 0,
    formatValue: v => formatPercentage(v),
    getTicks,
    component: props => {
        return (
            <Rows labelId="charts.axis_legends.users_percentage_survey" {...props}>
                {props.buckets.map((bucket, i) => (
                    <RowGroup
                        rowIndex={i}
                        key={bucket.id}
                        bucket={bucket}
                        {...props}
                        rowComponent={RowSingle}
                    />
                ))}
            </Rows>
        )
    }
}
