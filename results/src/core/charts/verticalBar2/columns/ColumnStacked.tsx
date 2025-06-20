import {
    BasicPointData,
    EmptyColumnProps,
    VerticalBarChartValues,
    VerticalBarViewDefinition
} from '../types'
import React from 'react'
import { Cell } from '../VerticalBarCell'
import { useColorScale, useGradient } from '../../common2/helpers/colors'
import sum from 'lodash/sum'
import take from 'lodash/take'
import { ColumnWrapper } from './ColumnWrapper'
import { FacetBucket } from '@devographics/types'

type ColumnStackedProps<
    SerieData,
    PointData extends BasicPointData,
    ChartStateType
> = EmptyColumnProps<PointData> & {
    columnId: string
    chartValues: VerticalBarChartValues
    point: PointData
    rowMetadata?: JSX.Element
    children?: JSX.Element
    viewDefinition: VerticalBarViewDefinition<SerieData, PointData, ChartStateType>
}

export const ColumnStacked = <
    SerieData,
    PointData extends BasicPointData & { facetBuckets: FacetBucket[] },
    ChartStateType
>(
    props: ColumnStackedProps<SerieData, PointData, ChartStateType>
) => {
    const { edition, chartState, chartValues, viewDefinition, point, columnId } = props
    const { getPointValue } = viewDefinition
    if (!getPointValue) {
        throw new Error('getPointValue not defined')
    }
    const { facetQuestion } = chartState
    const { question, facetBuckets, maxValue } = chartValues

    // const rowDimensions = allRowsCellDimensions[rowIndex]
    // const rowOffset = allRowsOffsets[rowIndex]
    const colorScale = useColorScale({ question: facetQuestion })
    return (
        <ColumnWrapper<SerieData, PointData, ChartStateType> {...props}>
            <div className="chart-faceted-bar">
                {point.facetBuckets.map((facetBucket, index) => {
                    const { id } = facetBucket
                    const gradient = useGradient({
                        id: facetBucket.id,
                        question: { ...facetQuestion, options: facetBuckets },
                        colorScale
                    })

                    const value = getPointValue(facetBucket, chartState)
                    const getHeight = (v: number) => (v * 100) / maxValue
                    const height = getHeight(value)
                    const values = point.facetBuckets.map(facetBucket =>
                        getHeight(getPointValue(facetBucket, chartState))
                    )
                    const offset = sum(take(values, index))

                    const entity = facetBuckets.find(o => o.id === id)?.entity
                    return (
                        <Cell
                            {...props}
                            key={id}
                            entity={entity}
                            cellId={id}
                            point={point}
                            value={value}
                            chartState={chartState}
                            height={height}
                            offset={offset}
                            cellIndex={index}
                            chartValues={chartValues}
                            gradient={gradient}
                            viewDefinition={viewDefinition}
                        />
                    )
                })}
            </div>
        </ColumnWrapper>
    )
}
