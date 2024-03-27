import React from 'react'
import './ChartHeading.scss'

export const ChartHeading = ({
    heading = null,
    children
}: {
    heading?: JSX.Element | null
    children: JSX.Element
}) => {
    return (
        <div className="chart-heading">
            {heading && <div className="chart-heading-title">{heading}</div>}
            <div className="chart-heading-content">{children}</div>
        </div>
    )
}

export default ChartHeading
