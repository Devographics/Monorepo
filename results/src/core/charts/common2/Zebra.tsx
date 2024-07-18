import { getInterval } from './Axis'
import './Zebra.scss'
import React from 'react'

export const Zebra = ({ ticks }: { ticks: number[] }) => {
    return (
        <div className="chart-gridlines">
            <div className="chart-gridlines-inner">
                {ticks.map((tick, index) => (
                    <div
                        key={tick}
                        className="chart-gridlines-item"
                        style={{ '--index': index, '--interval': getInterval(ticks.length) }}
                    />
                ))}
                {ticks.map((tick, index) => (
                    <div
                        key={tick}
                        className="chart-gridlines-item"
                        style={{ '--index': index, '--interval': getInterval(ticks.length) }}
                    />
                ))}
            </div>
        </div>
    )
}
