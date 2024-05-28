import React from 'react'
import { SingleBarColumn } from '../VerticalBarColumn'
import { ViewDefinition } from '../types'
import { Column, Columns, Row, Rows } from 'core/charts/common2'
// import { removeNoAnswer } from '../helpers/steps'
import { BucketUnits } from '@devographics/types'

export const Average: ViewDefinition = {
    getValue: bucket => bucket[BucketUnits.PERCENTAGE_QUESTION] || 0,
    steps: [
        /*removeNoAnswer*/
    ],
    component: props => {
        console.log(props)
        return (
            <Columns {...props} hasZebra={true}>
                {props.editions.map((edition, i) => (
                    <Column
                        key={edition.editionId}
                        edition={edition}
                        {...props}
                        columnComponent={SingleBarColumn}
                        showCount={false}
                    />
                ))}
            </Columns>
        )
    }
}
