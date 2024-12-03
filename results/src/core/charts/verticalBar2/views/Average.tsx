import React from 'react'
import Columns from '../columns/Columns'
import { EditionWithPointData, VerticalBarViewDefinition } from '../types'
import { formatQuestionValue } from 'core/charts/common2/helpers/format'
import { Lines } from '../lines'
import { ColumnEmpty } from '../columns/ColumnEmpty'
// import { removeNoAnswer } from '../helpers/steps'

import max from 'lodash/max'
import min from 'lodash/min'
import range from 'lodash/range'

export const Average: VerticalBarViewDefinition<EditionWithPointData> = {
    getPoints: serie => {
        const { allEditions } = serie.data.responses
        const startYear = min(allEditions.map(e => e.year)) ?? 0
        return allEditions.map(e => ({
            ...e,
            id: e.editionId,
            columnIndex: e.year - startYear
        }))
    },
    getColumnIds: (points: EditionWithPointData[]) => {
        const allYears = points.map(p => p.year)
        const minYear = min(allYears)
        const maxYear = max(allYears)
        if (minYear === undefined || maxYear === undefined) {
            return []
        }
        const years = range(minYear, maxYear + 1)
        return years.map(y => y.toString())
    },
    getPointValue: edition => edition.average || 0,
    getTicks: () => [{ value: 0 }, { value: 1 }, { value: 2 }, { value: 3 }, { value: 4 }],
    formatValue: formatQuestionValue,
    dataFilters: [
        /*removeNoAnswer*/
    ],
    component: props => {
        const { chartValues, points } = props
        const { columnIds, question } = chartValues
        const lineItem = { id: question.id, points }
        return (
            <Columns {...props} hasZebra={true} labelId="chart_units.average">
                <>
                    {columnIds.map((columnId, i) => (
                        <ColumnEmpty
                            {...props}
                            columnIndex={i}
                            key={columnId}
                            columnId={columnId}
                        />
                    ))}
                    <Lines<EditionWithPointData> lineItems={[lineItem]} {...props} />
                </>
            </Columns>
        )
    }
}
