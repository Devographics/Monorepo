import React from 'react'

export const ChartHeading = ({ children }: { children: JSX.Element }) => {
    return (
        <div className="chart-heading">
            <div className="chart-heading-content">{children}</div>
        </div>
    )
}

export default ChartHeading
