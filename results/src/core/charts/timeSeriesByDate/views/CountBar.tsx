import React from 'react'
// import { removeNoAnswer } from '../helpers/steps'
import { StandardQuestionData } from '@devographics/types'
import { VerticalBarViewDefinition } from 'core/charts/verticalBar2/types'
import { DateBucketWithPointData, TimeSeriesByDateChartState } from '../types'
import { useChartValues } from 'core/charts/verticalBar2/helpers/chartValues'
import { Count } from './Count'
import Columns from 'core/charts/verticalBar2/columns/Columns'
import { ColumnWrapper } from 'core/charts/verticalBar2/columns/ColumnWrapper'
import { ColumnSingle } from 'core/charts/verticalBar2/columns/ColumnSingle'

export const CountBar: VerticalBarViewDefinition<
    StandardQuestionData,
    DateBucketWithPointData,
    TimeSeriesByDateChartState
> = {
    ...Count,
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
        const lineItem = lineItems[0]
        return (
            <Columns<StandardQuestionData, DateBucketWithPointData, TimeSeriesByDateChartState>
                {...props}
                chartValues={chartValues}
                hasZebra={true}
                labelId="chart_units.count"
            >
                {columnIds.map((columnId, i) => {
                    const point = lineItem.points.find(p => p.columnId === columnId)
                    return point ? (
                        <ColumnSingle<
                            StandardQuestionData,
                            DateBucketWithPointData,
                            TimeSeriesByDateChartState
                        >
                            columnIndex={i}
                            {...props}
                            key={columnId}
                            columnId={columnId}
                            point={point}
                            showCount={false}
                            chartValues={chartValues}
                        />
                    ) : (
                        <ColumnWrapper<
                            StandardQuestionData,
                            DateBucketWithPointData,
                            TimeSeriesByDateChartState
                        >
                            {...props}
                            columnIndex={i}
                            key={columnId}
                            columnId={columnId}
                            chartValues={chartValues}
                        />
                    )
                })}
            </Columns>
        )
    }
}
