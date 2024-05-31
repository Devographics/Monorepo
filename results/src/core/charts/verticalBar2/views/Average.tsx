import React from 'react'
import { ColumnSingle } from '../columns/ColumnSingle'
import Columns from '../columns/Columns'
import { VerticalBarViewDefinition } from '../types'
import { formatCurrency } from 'core/charts/common2/helpers/labels'
import { Line } from '../lines'
import { ColumnStacked } from '../columns/ColumnStacked'
// import { removeNoAnswer } from '../helpers/steps'

export const Average: VerticalBarViewDefinition = {
    getEditionValue: edition => edition.average || 0,
    getTicks: () => [{ value: 0 }, { value: 1 }, { value: 2 }, { value: 3 }, { value: 4 }],
    formatValue: formatCurrency,
    dataFilters: [
        /*removeNoAnswer*/
    ],
    component: props => {
        const { chartValues, editions } = props
        const { question } = chartValues
        return (
            <Columns {...props} hasZebra={true} labelId="average_foo">
                <>
                    {props.editions.map((edition, i) => (
                        <ColumnSingle
                            columnIndex={i}
                            {...props}
                            key={edition.editionId}
                            edition={edition}
                            showCount={false}
                            showBar={false}
                        />
                    ))}
                    <Line editions={editions} {...props} />
                </>
            </Columns>
        )
    }
}
