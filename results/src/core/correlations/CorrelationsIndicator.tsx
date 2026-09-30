import React from 'react'
import Tooltip from 'core/components/Tooltip'
import T from 'core/i18n/T'
import Button from 'core/components/Button'
import { CorrelationItem } from '@devographics/types'
import { correlationColors, formatCorrelation } from './helpers'

export const CorrelationsIndicator = ({ correlations }: { correlations: CorrelationItem[] }) => {
    const top9 = []
    for (let i = 0; i < 9; i++) {
        if (correlations[i]) {
            top9.push(correlations[i])
        } else {
            top9.push({ strength: 'empty' })
        }
    }
    const maxCorrelation = correlations[0]
    return (
        <div className="chart-correlation-indicator">
            <Tooltip
                trigger={
                    <Button className="chart-correlation-indicator-button button-round ">
                        {/* <CorrelationsIcon size={'small'} /> */}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            {top9.map((c, i) => {
                                const col = Math.floor(i / 3)
                                const row = i % 3
                                return (
                                    <rect
                                        key={i}
                                        width="6"
                                        height="6"
                                        x={1 + row * 8}
                                        y={1 + col * 8}
                                        fill={correlationColors[c.strength]}
                                        rx="1"
                                    ></rect>
                                )
                            })}
                            {/* <rect width="6" height="6" x="1" y="9" fill="#E08B36" rx="1"></rect>
            <rect width="6" height="6" x="1" y="17" fill="#FBF467" rx="1"></rect>
            <rect width="6" height="6" x="9" y="1" fill="#E08B36" rx="1"></rect>
            <rect width="6" height="6" x="9" y="9" fill="#FBF467" rx="1"></rect>
            <rect width="6" height="6" x="9" y="17" fill="#D9D9D9" fillOpacity="0.2" rx="1"></rect>
            <rect width="6" height="6" x="17" y="1" fill="#E08B36" rx="1"></rect>
            <rect width="6" height="6" x="17" y="9" fill="#FBF467" rx="1"></rect>
            <rect width="6" height="6" x="17" y="17" fill="#D9D9D9" fillOpacity="0.2" rx="1"></rect> */}
                        </svg>
                        <span className="chart-correlation-count">
                            {formatCorrelation(maxCorrelation.correlation)}
                        </span>
                    </Button>
                }
                contents={
                    <T
                        k="correlations.correlations_trigger"
                        values={{ count: correlations.length }}
                        md={true}
                    />
                }
            />
        </div>
    )
}
