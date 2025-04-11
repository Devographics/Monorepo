import React from 'react'
// import { removeNoAnswer } from '../helpers/steps'
import { StandardQuestionData } from '@devographics/types'
import { VerticalBarViewDefinition } from 'core/charts/verticalBar2/types'
import { DateBucketWithPointData, TimeSeriesByDateChartState } from '../types'
import { useChartValues } from 'core/charts/verticalBar2/helpers/chartValues'
import { Count } from './Count'
import Columns from 'core/charts/verticalBar2/columns/Columns'
import { ColumnStacked } from 'core/charts/verticalBar2/columns/ColumnStacked'
import { ColumnWrapper } from 'core/charts/verticalBar2/columns/ColumnWrapper'

export const CountStackedBar: VerticalBarViewDefinition<
    StandardQuestionData,
    DateBucketWithPointData,
    TimeSeriesByDateChartState
> = {
    ...Count,
    component: props => {
        const { serie, question, chartState, block, viewDefinition, facetBuckets } = props
        const { getLineItems } = viewDefinition
        const lineItems = getLineItems({ serie, question, chartState })
        const chartValues = useChartValues({
            lineItems,
            chartState,
            block,
            question,
            viewDefinition: Count,
            facetBuckets
        })
        const commonProps = {
            ...props,
            chartValues
        }
        const { columnIds } = chartValues
        const lineItem = lineItems[0]
        return (
            <Columns<StandardQuestionData, DateBucketWithPointData, TimeSeriesByDateChartState>
                {...commonProps}
                chartValues={chartValues}
                hasZebra={true}
                labelId="chart_units.count"
            >
                {columnIds.map((columnId, i) => {
                    const point = lineItem.points.find(p => p.columnId === columnId)
                    return point ? (
                        <ColumnStacked<
                            StandardQuestionData,
                            DateBucketWithPointData,
                            TimeSeriesByDateChartState
                        >
                            columnIndex={i}
                            {...commonProps}
                            key={columnId}
                            columnId={columnId}
                            point={point}
                            showCount={false}
                        />
                    ) : (
                        <ColumnWrapper<
                            StandardQuestionData,
                            DateBucketWithPointData,
                            TimeSeriesByDateChartState
                        >
                            {...commonProps}
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
