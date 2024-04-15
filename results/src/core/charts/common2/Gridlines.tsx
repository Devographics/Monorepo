import { getInterval } from './Axis'
import './Gridlines.scss'
import React from 'react'

export const Gridlines = ({ ticks }: { ticks: number[] }) => {
    return (
        <div className="chart-gridlines">
            {ticks.map((tick, index) => (
                <div
                    key={tick}
                    className="chart-gridlines-item"
                    style={{ '--index': index, '--interval': getInterval(ticks) }}
                />
            ))}
        </div>
    )
}
