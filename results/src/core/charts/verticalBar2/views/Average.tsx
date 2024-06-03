import React from 'react'
import { ColumnSingle } from '../columns/ColumnSingle'
import Columns from '../columns/Columns'
import { VerticalBarViewDefinition } from '../types'
import { formatCurrency } from 'core/charts/common2/helpers/labels'
import { Lines } from '../lines'
import { ColumnStacked } from '../columns/ColumnStacked'
import { getEditionByYear } from '../helpers/other'
import { ColumnEmpty } from '../columns/ColumnEmpty'
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
        const { years, question } = chartValues
        const item = { id: question.id, editions }
        return (
            <Columns {...props} hasZebra={true} labelId="average_foo">
                <>
                    {years.map((year, i) => (
                        <ColumnEmpty {...props} columnIndex={i} key={year} year={year} />
                    ))}
                    <Lines items={[item]} {...props} />
                </>
            </Columns>
        )
    }
}
