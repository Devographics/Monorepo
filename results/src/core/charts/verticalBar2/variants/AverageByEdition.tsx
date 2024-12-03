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
import { VerticalBarWrapper } from '../VerticalBarWrapper'
import { DataSeries } from 'core/filters/types'
import { BlockComponentProps } from 'core/types'
import { getAllEditions } from '../helpers/other'
import { getDefaultState, useChartState } from '../helpers/chartState'

export const viewDefinition: VerticalBarViewDefinition<
    StandardQuestionData,
    EditionWithPointData,
    VerticalBarChartState
> = {
    getLineItems: ({ serie, question }) => {
        const { allEditions } = serie.data.responses
        const startYear = min(allEditions.map(e => e.year)) ?? 0
        const points = allEditions.map(e => ({
            ...e,
            id: e.editionId,
            columnId: e.year.toString(),
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
    ]
}

export interface AverageByEditionProps extends BlockComponentProps {
    data: StandardQuestionData
    series: DataSeries<StandardQuestionData>[]
}

export const AverageByEdition = (props: AverageByEditionProps) => {
    const { block, series, question } = props
    const serie = series[0]
    const allEditions = getAllEditions({ serie, block })
    const currentEdition = allEditions.at(-1)
    if (currentEdition === undefined) {
        throw new Error(`${block.id}: empty allEditions array`)
    }

    const chartState = useChartState(getDefaultState({ block }))

    const { getLineItems } = viewDefinition
    const lineItems = getLineItems({ serie, question, chartState })
    const chartValues = useChartValues({ lineItems, chartState, block, question })
    const { columnIds } = chartValues

    const commonProps = {
        ...props,
        chartState,
        chartValues,
        currentEdition,
        viewDefinition
    }

    return (
        <VerticalBarWrapper {...props}>
            <Columns {...commonProps} hasZebra={true} labelId="chart_units.average">
                <>
                    {columnIds.map((columnId, i) => (
                        <ColumnWrapper<EditionWithPointData>
                            {...commonProps}
                            columnIndex={i}
                            key={columnId}
                            columnId={columnId}
                        />
                    ))}
                    <Lines<StandardQuestionData, EditionWithPointData, VerticalBarChartState>
                        {...commonProps}
                        lineItems={lineItems}
                    />
                </>
            </Columns>
        </VerticalBarWrapper>
    )
}
