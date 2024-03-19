import React from 'react'
import { SingleBarRow } from '../HorizontalBarRow'
import { ViewDefinition } from '../types'
import { Row, Rows, SeriesHeading } from 'core/charts/common2'
import { removeNoAnswer } from '../helpers/steps'

export const Count: ViewDefinition = {
    steps: [removeNoAnswer],
    component: ({ buckets, ...rest }) => {
        return (
            <>
                <SeriesHeading />
                <Rows>
                    {buckets.map((bucket, i) => (
                        <Row
                            key={bucket.id}
                            bucket={bucket}
                            {...rest}
                            rowComponent={SingleBarRow}
                        />
                    ))}
                </Rows>
            </>
        )
    }
}
