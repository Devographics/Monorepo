import './ChartFooter.scss'
import React from 'react'

export const ChartFooter = ({ left, right }: { left?: JSX.Element; right?: JSX.Element }) => {
    return (
        <div className="chart-footer">
            <div className="chart-footer-left">{left}</div>
            <div className="chart-footer-right">{right}</div>
        </div>
    )
}

export default ChartFooter
