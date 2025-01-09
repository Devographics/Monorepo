import React from 'react'
import { formatQuestionValue } from 'core/charts/common2/helpers/format'
// import { removeNoAnswer } from '../helpers/steps'
import max from 'lodash/max'
import min from 'lodash/min'
import range from 'lodash/range'
import sortBy from 'lodash/sortBy'
import { StandardQuestionData } from '@devographics/types'
import Columns from 'core/charts/verticalBar2/columns/Columns'
import { ColumnWrapper } from 'core/charts/verticalBar2/columns/ColumnWrapper'
import { Lines } from 'core/charts/verticalBar2/lines'
import {
    LineItem,
    VerticalBarChartState,
    VerticalBarViewDefinition
} from 'core/charts/verticalBar2/types'
import { DateBucketWithPointData, TimeSeriesByDateChartState } from '../types'
import * as d3 from 'd3'
import { addDaysToDate, diffDays, formatDateToYMD } from '../helpers/other'
import { useChartValues } from 'core/charts/verticalBar2/helpers/chartValues'

export const Count: VerticalBarViewDefinition<
    StandardQuestionData,
    DateBucketWithPointData,
    TimeSeriesByDateChartState
> = {
    getLineItems: ({ serie, question }) => {
        let buckets = serie.data.responses.currentEdition.buckets
        // make sure buckets are sorted by date (id)
        buckets = sortBy(buckets, 'id')
        const points = buckets.map(bucket => {
            const startDate = new Date(min(buckets.map(e => Number(e.id))) || 0)
            const currentDate = new Date(Number(bucket.id))
            const columnId = formatDateToYMD(currentDate)
            const columnIndex = diffDays(startDate, currentDate)
            const point: DateBucketWithPointData = {
                ...bucket,
                date: Number(bucket.id),
                columnId,
                columnIndex
            }
            return point
        })
        // this view returns a single line item for now
        const lineItem = { id: question.id, entity: question.entity, points }
        return [lineItem]
    },
    getColumnIds: (lineItems: LineItem<DateBucketWithPointData>[]) => {
        // in case we have multiple lines, make sure we collect years from all of them
        const allDates = lineItems
            .map(l => l.points)
            .flat()
            .map(p => p.date)

        const minDate = new Date(min(allDates) as number)
        const maxDate = new Date(max(allDates) as number)
        const dateCount = diffDays(minDate, maxDate)
        if (minDate === undefined || maxDate === undefined) {
            return []
        }
        const dates = range(dateCount + 1).map(daysFromStart => {
            return addDaysToDate(minDate, daysFromStart)
        })
        const columnIds = dates.map(formatDateToYMD)
        return columnIds
    },
    formatColumnId: ({ columnId, columnIndex, chartValues }) => {
        const { totalColumns } = chartValues
        const [year, month, date] = columnId.split('-')
        const label = `${month}/${date}`
        if (totalColumns < 8) {
            return label
        } else if (totalColumns < 12) {
            return columnIndex % 2 === 0 ? label : ''
        } else {
            return columnIndex % 3 === 0 ? label : ''
        }
    },
    getPointValue: point => point.count || 0,
    getTicks: maxValue => {
        if (!maxValue) {
            return []
        }

        const scale = d3.scaleLinear().domain([0, maxValue])

        return scale.ticks(10).map(s => ({ value: s }))
    },
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
            viewDefinition: Count
        })
        const { columnIds } = chartValues
        return (
            <Columns<StandardQuestionData, DateBucketWithPointData, TimeSeriesByDateChartState>
                {...props}
                chartValues={chartValues}
                hasZebra={true}
                labelId="chart_units.count"
            >
                <>
                    {columnIds.map((columnId, i) => (
                        <ColumnWrapper<
                            StandardQuestionData,
                            DateBucketWithPointData,
                            VerticalBarChartState
                        >
                            {...props}
                            columnIndex={i}
                            key={columnId}
                            columnId={columnId}
                            chartValues={chartValues}
                        />
                    ))}
                    <Lines<StandardQuestionData, DateBucketWithPointData, VerticalBarChartState>
                        {...props}
                        lineItems={lineItems}
                        chartValues={chartValues}
                    />
                </>
            </Columns>
        )
    }
}
