import React from 'react'
import { SingleBarColumn } from '../VerticalBarColumn'
import { ViewDefinition } from '../types'
import { Column, Columns, Row, Rows } from 'core/charts/common2'
// import { removeNoAnswer } from '../helpers/steps'
import { BucketUnits } from '@devographics/types'

export const Count: ViewDefinition = {
    getValue: bucket => bucket[BucketUnits.COUNT] || 0,
    steps: [
        /*removeNoAnswer*/
    ],
    component: props => {
        return (
            <Columns {...props} hasZebra={true}>
                {props.buckets.map((bucket, i) => (
                    <Column
                        key={bucket.id}
                        bucket={bucket}
                        {...props}
                        columnComponent={SingleBarColumn}
                        showCount={false}
                    />
                ))}
            </Columns>
        )
    }
}
