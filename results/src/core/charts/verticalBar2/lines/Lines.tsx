import './Lines.scss'
import React, { useRef } from 'react'
import { BasicPointData, LineItem, VerticalBarViewProps } from '../types'
import { Line } from './Line'
import { useHeight, useWidth } from 'core/charts/common2/helpers'

export const Lines = <PointData extends BasicPointData>(
    props: VerticalBarViewProps<PointData> & { lineItems: LineItem<PointData>[] }
) => {
    const { lineItems, chartState } = props

    // since SVG doesn't support z-index, we need to put any highlighted line last in the
    // DOM to make sure it appears above the others
    const { highlighted } = chartState

    const itemsWithIndex = lineItems.map((lineItem, i) => ({ ...lineItem, lineIndex: i }))
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
                            <Line<PointData>
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
                            <Line<PointData>
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
