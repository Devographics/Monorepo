import './CellLabel.scss'
import React from 'react'
import { CharWrapper, characters } from 'core/components/Characters'

export const CellLabel = ({ label }: { label: string }) => (
    <span className="chart-cell-label" role="img" aria-label={label}>
        {[...label].map((char, index) => {
            const Component = characters[char]
            return (
                <CharWrapper key={char + index}>
                    <Component key={index} />
                </CharWrapper>
            )
        })}
        {/* <svg>
            <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                stroke="currentColor"
            >
                {label}
            </text>
        </svg> */}
    </span>
)
