import React from 'react'
import Columns from '../columns/Columns'
import { VerticalBarViewDefinition } from '../types'
import { formatQuestionValue } from 'core/charts/common2/helpers/format'
import { Lines } from '../lines'
import { ColumnEmpty } from '../columns/ColumnEmpty'
// import { removeNoAnswer } from '../helpers/steps'

export const Average: VerticalBarViewDefinition = {
    getEditionValue: edition => edition.average || 0,
    getTicks: () => [{ value: 0 }, { value: 1 }, { value: 2 }, { value: 3 }, { value: 4 }],
    formatValue: formatQuestionValue,
    dataFilters: [
        /*removeNoAnswer*/
    ],
    component: props => {
        const { chartValues, editions } = props
        const { years, question } = chartValues
        const item = { id: question.id, editions }
        return (
            <Columns {...props} hasZebra={true} labelId="chart_units.average">
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
