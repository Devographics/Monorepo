import React from 'react'
import { ColumnSingle } from '../columns/ColumnSingle'
import Columns from '../columns/Columns'
import { VerticalBarViewDefinition } from '../types'
// import { removeNoAnswer } from '../helpers/steps'

export const Average: VerticalBarViewDefinition = {
    getEditionValue: edition => edition.average || 0,
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
                        columnIndex={i}
                        key={edition.editionId}
                        edition={edition}
                        showCount={false}
                    />
                ))}
            </Columns>
        )
    }
}
