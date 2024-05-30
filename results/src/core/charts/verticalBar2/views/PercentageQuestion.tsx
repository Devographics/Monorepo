import React from 'react'
import { ColumnStacked } from '../columns/ColumnStacked'
import { VerticalBarViewDefinition } from '../types'
// import { removeNoAnswer } from '../helpers/steps'
import { BucketUnits } from '@devographics/types'
import Columns from '../columns/Columns'

export const PercentageQuestion: VerticalBarViewDefinition = {
    getValue: bucket => bucket[BucketUnits.PERCENTAGE_QUESTION] || 0,
    getTicks: () => [
        { value: 0 },
        { value: 20 },
        { value: 40 },
        { value: 60 },
        { value: 80 },
        { value: 100 }
    ],
    dataFilters: [
        /*removeNoAnswer*/
    ],
    component: props => {
        return (
            <Columns {...props} hasZebra={true}>
                {props.editions.map((edition, i) => (
                    <ColumnStacked
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
