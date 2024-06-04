import './Lines.scss'
import React, { useRef } from 'react'
import { LineItem, VerticalBarViewProps } from '../types'
import { Line } from './Line'
import { useHeight, useWidth } from 'core/charts/common2/helpers'

export const Lines = (props: VerticalBarViewProps & { items: LineItem[] }) => {
    const { items, chartState } = props
    // since SVG doesn't support z-index, we need to put any highlighted line last in the
    // DOM to make sure it appears above the others
    const { highlighted } = chartState

    const itemsWithIndex = items.map((item, i) => ({ ...item, lineIndex: i }))
    const regularItems = itemsWithIndex.filter(item => item.id !== highlighted)
    const highlightedItem = itemsWithIndex.filter(item => item.id === highlighted)

    const ref = useRef<HTMLDivElement>(null)
    const width = useWidth(ref)
    const height = useHeight(ref)
    const commonProps = { ...props, width, height }
    return (
        <div className="chart-lines-wrapper" ref={ref}>
            {height && width && (
                <svg className="chart-lines">
                    {regularItems.map((item, i) => {
                        return <Line {...commonProps} key={item.id} {...item} />
                    })}
                    {highlightedItem.map((item, i) => {
                        return <Line {...commonProps} key={item.id} {...item} />
                    })}
                </svg>
            )}
        </div>
    )
}
