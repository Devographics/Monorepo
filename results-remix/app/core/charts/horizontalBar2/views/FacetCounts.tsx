import React from 'react'
import { FacetRow } from '../HorizontalBarRow'
import Legend from '../../common2/Legend'
import { ViewDefinition } from '../types'
import { Row, Rows } from 'core/charts/common2'
import { removeNoAnswer, removeNotApplicable, removeOverall } from '../helpers/steps'
import { BucketUnits } from '@devographics/types'

export const FacetCounts: ViewDefinition = {
    getValue: facetBucket => facetBucket[BucketUnits.COUNT] || 0,
    steps: [removeOverall, removeNoAnswer],
    showLegend: true,
    component: props => {
        return (
            <Rows {...props}>
                {props.buckets.map((bucket, i) => (
                    <Row key={bucket.id} bucket={bucket} {...props} rowComponent={FacetRow} />
                ))}
            </Rows>
        )
    }
}
