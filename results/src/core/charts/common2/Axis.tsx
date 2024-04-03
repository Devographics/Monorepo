import T from 'core/i18n/T'
import './Axis.scss'
import React from 'react'
import max from 'lodash/max'
import round from 'lodash/round'

export const getTicks = (values: number[]) => {
    const NUMBER_OF_TICKS = 5
    const maxValue = max(values) || 0
    const ticks = [...Array(NUMBER_OF_TICKS + 1)].map(
        (a, i) => round((i * maxValue) / NUMBER_OF_TICKS),
        1
    )
    return ticks
}

export const getInterval = (ticks: number[]) => 100 / (ticks.length - 1)

export const Axis = ({
    variant,
    ticks,
    labelId,
    formatValue
}: {
    variant: 'top' | 'bottom'
    ticks: number[]
    labelId: string
    formatValue: (v: number) => string
}) => {
    return (
        <div className={`chart-axis chart-axis-${variant}`}>
            <div className="chart-axis-inner">
                <div className="chart-axis-ticks">
                    {ticks.map((tick, index) => (
                        <div
                            key={tick}
                            className="chart-axis-tick"
                            style={{ '--index': index, '--interval': getInterval(ticks) }}
                        >
                            <div className="chart-axis-tick-label">{formatValue(tick)}</div>
                        </div>
                    ))}
                </div>
                {variant === 'bottom' && (
                    <div className="chart-axis-label">
                        <T k={labelId} />
                    </div>
                )}
            </div>
        </div>
    )
}

export default Axis
