import React from 'react'
import { ColumnSingle } from '../columns/ColumnSingle'
import { VerticalBarViewDefinition } from '../types'
import { Columns } from 'core/charts/common2'
// import { removeNoAnswer } from '../helpers/steps'
import { BucketUnits } from '@devographics/types'

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
