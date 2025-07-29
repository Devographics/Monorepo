import './Lines.scss'
import React, { useRef } from 'react'
import {
    BasicPointData,
    LineItem,
    VerticalBarChartValues,
    VerticalBarViewDefinition
} from '../types'
import { Line } from './Line'
import { useHeight, useWidth } from 'core/charts/common2/helpers'
import { BlockVariantDefinition, PageContextValue } from 'core/types'
import { getSubsetIds } from 'core/charts/multiItemsRatios/helpers/subsets'

export type LinesComponentProps<SerieData, PointData extends BasicPointData, ChartStateType> = {
    chartState: ChartStateType
    block: BlockVariantDefinition
    lineItems: LineItem<PointData>[]
    chartValues: VerticalBarChartValues
    viewDefinition: VerticalBarViewDefinition<SerieData, PointData, ChartStateType>
    pageContext: PageContextValue
}

export const Lines = <SerieData, PointData extends BasicPointData, ChartStateType>(
    props: LinesComponentProps<SerieData, PointData, ChartStateType>
) => {
    const { lineItems, chartState, pageContext } = props

    // since SVG doesn't support z-index, we need to put any highlighted line last in the
    // DOM to make sure it appears above the others
    const { highlighted, subset } = chartState

    const sections = pageContext?.currentEdition.sections
    const subsetIds = getSubsetIds({ subset, lineItems, sections })

    const itemsWithIndex = lineItems.map((lineItem, i) => ({
        ...lineItem,
        lineIndex: i,
        // index within the subset of enabled lines
        subsetLineIndex: subset ? subsetIds.indexOf(lineItem.id) : i,
        isDisabled: subset && !subsetIds.includes(lineItem.id)
    }))
    console.log(itemsWithIndex)
    const regularItems = itemsWithIndex.filter(lineItem => lineItem.id !== highlighted)
    const highlightedItem = itemsWithIndex.filter(lineItem => lineItem.id === highlighted)

    const ref = useRef<HTMLDivElement>(null)
    const width = useWidth(ref)
    const height = useHeight(ref)
    const commonProps = { ...props, hasMultiple: lineItems.length > 1 }

    return (
        <div className="chart-lines-wrapper" ref={ref}>
            {height && width && (
                <svg className="chart-lines">
                    {regularItems.map(item => {
                        return (
                            <Line<SerieData, PointData, ChartStateType>
                                {...commonProps}
                                width={width}
                                height={height}
                                key={item.id}
                                {...item}
                            />
                        )
                    })}
                    {highlightedItem.map(item => {
                        return (
                            <Line<SerieData, PointData, ChartStateType>
                                {...commonProps}
                                width={width}
                                height={height}
                                key={item.id}
                                {...item}
                            />
                        )
                    })}
                </svg>
            )}
        </div>
    )
}
