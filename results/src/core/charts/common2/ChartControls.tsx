import './ChartControls.scss'
import React from 'react'

export const ChartControls = ({ left, right }: { left?: JSX.Element; right?: JSX.Element }) => {
    return (
        <div className="chart-controls">
            <div className="chart-controls-left">{left}</div>
            <div className="chart-controls-right">{right}</div>
        </div>
    )
}

export default ChartControls
