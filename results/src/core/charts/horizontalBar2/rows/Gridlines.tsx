import { getInterval } from '../../common2/Axis'
import React from 'react'
import { Tick } from '../../common2/types'

export const Gridlines = ({ ticks }: { ticks: Tick[] }) => {
    const interval = getInterval(ticks.length)
    return (
        <div className="chart-row-gridlines">
            {ticks.map((tick, index) => {
                // if a tick's xOffset is specified, use it as a px value
                // if not, assume all ticks are spaced out equally using % values
                const xOffset = tick.xOffset ? `${tick.xOffset}px` : `${index * interval}%`
                return (
                    <div
                        key={tick.value}
                        className="chart-row-gridlines-item"
                        style={{ '--xOffset': xOffset }}
                    />
                )
            })}
        </div>
    )
}
