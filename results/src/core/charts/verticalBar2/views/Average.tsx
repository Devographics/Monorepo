import React from 'react'
import Columns from '../columns/Columns'
import { EditionWithPointData, LineItem, VerticalBarViewDefinition } from '../types'
import { formatQuestionValue } from 'core/charts/common2/helpers/format'
import { Lines } from '../lines'
import { ColumnEmpty } from '../columns/ColumnEmpty'
// import { removeNoAnswer } from '../helpers/steps'

import max from 'lodash/max'
import min from 'lodash/min'
import range from 'lodash/range'

export const Average: VerticalBarViewDefinition<EditionWithPointData> = {
    getLineItems: ({ serie, question }) => {
        const { allEditions } = serie.data.responses
        const startYear = min(allEditions.map(e => e.year)) ?? 0
        const points = allEditions.map(e => ({
            ...e,
            id: e.editionId,
            columnIndex: e.year - startYear
        }))
        // this view returns a single line item for now
        const lineItem = { id: question.id, entity: question.entity, points }
        return [lineItem]
    },
    getColumnIds: (lineItems: LineItem<EditionWithPointData>[]) => {
        // in case we have multiple lines, make sure we collect years from all of them
        const allYears = lineItems
            .map(l => l.points)
            .flat()
            .map(p => p.year)
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
        const { chartValues } = props
        const { columnIds } = chartValues
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
                    <Lines<EditionWithPointData> {...props} />
                </>
            </Columns>
        )
    }
}
