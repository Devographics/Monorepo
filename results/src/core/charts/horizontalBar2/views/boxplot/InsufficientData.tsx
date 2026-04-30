import React from 'react'
import './InsufficientData.scss'

export const InsufficientData = ({
    children,
    width,
    y
}: {
    children: React.ReactNode
    width: string
    y: number
}) => {
    return (
        <text
            className="insufficient-data"
            width={width}
            y={y}
            textAnchor="start"
            alignmentBaseline="middle"
        >
            {children}
        </text>
    )
}
