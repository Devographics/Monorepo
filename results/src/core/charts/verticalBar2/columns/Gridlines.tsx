import { getInterval } from '../../common2/AxisV'
import React from 'react'
import { Tick } from '../../common2/types'

export const Gridlines = ({ ticks }: { ticks: Tick[] }) => {
    const interval = getInterval(ticks.length)
    return (
        <div className="chart-columns-gridlines">
            {ticks.map((tick, index) => {
                // if a tick's xOffset is specified, use it as a px value
                // if not, assume all ticks are spaced out equally using % values
                const yOffset = tick.yOffset ? `${tick.yOffset}px` : `${index * interval}%`
                return (
                    <div
                        key={tick.value}
                        className="chart-columns-gridlines-item"
                        style={{ '--yOffset': yOffset }}
                    />
                )
            })}
        </div>
    )
}
