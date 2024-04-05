import React from 'react'
import { FacetRow } from '../HorizontalBarRow'
import Legend from '../../common2/Legend'
import { ViewDefinition } from '../types'
import { Row, Rows, getTicks } from 'core/charts/common2'
import { removeNoAnswer, removeNotApplicable } from '../helpers/steps'
import { BucketUnits, FacetBucket } from '@devographics/types'

const getValue = (facetBucket: FacetBucket) => facetBucket[BucketUnits.PERCENTAGE_BUCKET] || 0

export const PercentageBucket: ViewDefinition = {
    getValue,
    steps: [removeNoAnswer],
    showLegend: true,
    component: props => {
        return (
            <Rows
                {...props}
                ticks={[0, 20, 40, 60, 80, 100]}
                formatValue={t => `${t}%`}
                labelId="charts.axis_legends.users_percentageBucket"
                hasZebra={true}
            >
                {props.buckets.map((bucket, i) => (
                    <Row key={bucket.id} bucket={bucket} {...props} rowComponent={FacetRow} />
                ))}
            </Rows>
        )
    }
}
