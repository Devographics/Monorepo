import React from 'react'
import { SingleBarRow } from '../HorizontalBarRow'
import { ViewDefinition } from '../types'
import { Row, Rows, SeriesHeading } from 'core/charts/common2'
import { removeNoAnswer, removeNotApplicable } from '../helpers/steps'

export const Average: ViewDefinition = {
    steps: [removeNotApplicable, removeNoAnswer],
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
