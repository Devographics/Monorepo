import React from 'react'
import { ColumnStacked } from '../columns/ColumnStacked'
import { VerticalBarViewDefinition } from '../types'
import { Columns } from 'core/charts/common2'
// import { removeNoAnswer } from '../helpers/steps'
import { BucketUnits } from '@devographics/types'

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
