import './ChartControls.scss'
import React from 'react'

export const ChartControls = ({
    top,
    left,
    right
}: {
    top?: JSX.Element
    left?: JSX.Element
    right?: JSX.Element
}) => {
    return (
        <div className="chart-controls">
            {top && <div className="chart-controls-top">{top}</div>}
            <div className="chart-controls-bottom">
                <div className="chart-controls-left">{left}</div>
                <div className="chart-controls-right">{right}</div>
            </div>
        </div>
    )
}

export default ChartControls
