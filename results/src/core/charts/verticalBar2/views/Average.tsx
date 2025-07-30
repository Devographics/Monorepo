import React from 'react'
import Columns from '../columns/Columns'
import {
    EditionWithPointData,
    LineItem,
    VerticalBarChartState,
    VerticalBarViewDefinition
} from '../types'
import { formatQuestionValue } from 'core/charts/common2/helpers/format'
import { Lines } from '../lines'
// import { removeNoAnswer } from '../helpers/steps'
import max from 'lodash/max'
import min from 'lodash/min'
import range from 'lodash/range'
import { StandardQuestionData } from '@devographics/types'
import { ColumnWrapper } from '../columns/ColumnWrapper'
import { useChartValues } from '../helpers/chartValues'
import { getSubfieldObject } from '../helpers/other'

export const Average: VerticalBarViewDefinition<
    StandardQuestionData,
    EditionWithPointData,
    VerticalBarChartState
> = {
    getLineItems: ({ serie, question }) => {
        const subFieldObject = getSubfieldObject(serie)
        const { allEditions } = subFieldObject
        const startYear = min(allEditions.map(e => e.year)) ?? 0
        const points = allEditions.map(e => ({
            ...e,
            id: e.editionId,
            columnId: e.year.toString(),
            columnIndex: e.year - startYear,
            value: e.average || 0
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
    formatColumnId: ({ columnId }) => columnId,
    getPointValue: point => point.average || 0,
    // TODO: this seems hardcoded for happiness questions,
    // will probably break if used for other question types with different scales?
    getTicks: () => [{ value: 1 }, { value: 2 }, { value: 3 }, { value: 4 }, { value: 5 }],
    formatValue: formatQuestionValue,
    dataFilters: [
        /*removeNoAnswer*/
    ],
    component: props => {
        const { serie, question, chartState, block, viewDefinition } = props
        const { getLineItems } = viewDefinition
        const lineItems = getLineItems({ serie, question, chartState })
        const chartValues = useChartValues({
            lineItems,
            chartState,
            block,
            question,
            viewDefinition: Average
        })
        const { columnIds } = chartValues
        return (
            <Columns
                {...props}
                chartValues={chartValues}
                hasZebra={true}
                labelId="chart_units.average"
            >
                <>
                    {columnIds.map((columnId, i) => (
                        <ColumnWrapper<
                            StandardQuestionData,
                            EditionWithPointData,
                            VerticalBarChartState
                        >
                            {...props}
                            columnIndex={i}
                            key={columnId}
                            columnId={columnId}
                            chartValues={chartValues}
                        />
                    ))}
                    <Lines<StandardQuestionData, EditionWithPointData, VerticalBarChartState>
                        {...props}
                        lineItems={lineItems}
                        chartValues={chartValues}
                    />
                </>
            </Columns>
        )
    }
}
