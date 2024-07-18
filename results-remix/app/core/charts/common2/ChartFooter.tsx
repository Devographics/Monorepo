import './ChartFooter.scss'
import React from 'react'

export const ChartFooter = ({ children }: { children: JSX.Element }) => {
    return <div className="chart-footer">{children}</div>
}

export default ChartFooter
