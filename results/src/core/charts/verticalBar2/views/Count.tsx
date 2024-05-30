import React from 'react'
import { ColumnSingle } from '../columns/ColumnSingle'
import { VerticalBarViewDefinition } from '../types'
// import { removeNoAnswer } from '../helpers/steps'
import { BucketUnits } from '@devographics/types'
import Columns from '../columns/Columns'

export const Count: VerticalBarViewDefinition = {
    getValue: bucket => bucket[BucketUnits.COUNT] || 0,
    dataFilters: [
        /*removeNoAnswer*/
    ],
    component: props => {
        return (
            <Columns {...props} hasZebra={true}>
                {props.editions.map((edition, i) => (
                    <ColumnSingle
                        columnIndex={i}
                        {...props}
                        key={edition.editionId}
                        edition={edition}
                        showCount={false}
                    />
                ))}
            </Columns>
        )
    }
}
