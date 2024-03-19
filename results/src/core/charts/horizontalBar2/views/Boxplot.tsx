import React from 'react'
import { BoxPlotRow } from '../HorizontalBarRow'
import { ViewProps } from '../types'
import { Row, Rows, SeriesHeading } from 'core/charts/common2'

export const Boxplot = ({ buckets, ...rest }: ViewProps) => {
    return (
        <>
            <SeriesHeading />
            <Rows>
                {buckets.map((bucket, i) => (
                    <Row key={bucket.id} bucket={bucket} {...rest} rowComponent={BoxPlotRow} />
                ))}
            </Rows>
        </>
    )
}
