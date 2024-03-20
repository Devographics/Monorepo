import React from 'react'
import { FacetRow } from '../HorizontalBarRow'
import Legend from '../../common2/Legend'
import { ViewDefinition } from '../types'
import { Row, Rows } from 'core/charts/common2'
import { removeNoAnswer, removeNotApplicable } from '../helpers/steps'
import { BucketUnits } from '@devographics/types'

export const PercentageBucket: ViewDefinition = {
    getValue: facetBucket => facetBucket[BucketUnits.PERCENTAGE_BUCKET] || 0,
    steps: [removeNotApplicable, removeNoAnswer],
    component: props => {
        return (
            <>
                <Legend {...props} />
                <Rows>
                    {props.buckets.map((bucket, i) => (
                        <Row key={bucket.id} bucket={bucket} {...props} rowComponent={FacetRow} />
                    ))}
                </Rows>
            </>
        )
    }
}
