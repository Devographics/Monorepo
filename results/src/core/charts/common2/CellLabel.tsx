import './CellLabel.scss'
import React from 'react'

export const CellLabel = ({ label }: { label: string }) => (
    <span className="chart-cell-label">
        <svg>
            <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                stroke="currentColor"
            >
                {label}
            </text>
        </svg>
    </span>
)
