import React from 'react'
import { FacetRow } from '../HorizontalBarRow'
import Legend from '../../common2/Legend'
import { ViewProps } from '../types'
import { Row, Rows, SeriesHeading } from 'core/charts/common2'

export const PercentageBucket = ({ buckets, ...rest }: ViewProps) => {
    return (
        <>
            <SeriesHeading />
            <Legend {...rest} />
            <Rows>
                {buckets.map((bucket, i) => (
                    <Row key={bucket.id} bucket={bucket} {...rest} rowComponent={FacetRow} />
                ))}
            </Rows>
        </>
    )
}
