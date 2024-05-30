import React from 'react'
import { ColumnSingle } from '../columns/ColumnSingle'
import { HorizontalBarViewDefinition } from '../../horizontalBar2/types'
import { Columns } from 'core/charts/common2'
// import { removeNoAnswer } from '../helpers/steps'

export const Average: HorizontalBarViewDefinition = {
    getValue: edition => edition.average,
    getTicks: () => [{ value: 0 }, { value: 1 }, { value: 2 }, { value: 3 }, { value: 4 }],
    dataFilters: [
        /*removeNoAnswer*/
    ],
    component: props => {
        const { chartValues } = props
        const { question } = chartValues
        return (
            <Columns {...props} hasZebra={true} labelId="average_foo">
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
