import './Lines.scss'
import React from 'react'
import { LineItem, VerticalBarViewProps } from '../types'
import { Line } from './Line'

export const Lines = (props: VerticalBarViewProps & { items: LineItem[] }) => {
    const { items } = props

    return (
        <div className="chart-columns-lines-wrapper">
            <svg className="chart-columns-lines">
                {items.map((item, i) => {
                    return (
                        <Line
                            {...props}
                            key={item.id}
                            lineIndex={i}
                            id={item.id}
                            editions={item.editions}
                        />
                    )
                })}
            </svg>
        </div>
    )
}
