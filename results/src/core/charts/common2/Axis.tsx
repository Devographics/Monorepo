import T from 'core/i18n/T'
import './Axis.scss'
import React from 'react'
import { FormatValueType, Tick } from './types'
import { QuestionMetadata } from '@devographics/types'

export const getInterval = (tickCount: number) => 100 / (tickCount - 1)

export const Axis = ({
    variant,
    ticks,
    question,
    labelId,
    formatValue
}: {
    variant: 'top' | 'bottom'
    ticks: Tick[]
    question: QuestionMetadata
    labelId?: string
    formatValue: FormatValueType
}) => {
    const interval = getInterval(ticks.length)

    return (
        <div className={`chart-axis chart-axis-horizontal chart-axis-${variant} chart-subgrid`}>
            <div className="chart-axis-inner">
                <div className="chart-axis-ticks">
                    {ticks.map((tick, index) => {
                        // if a tick's xOffset is specified, use it as a px value
                        // if not, assume all ticks are spaced out equally using % values
                        const xOffset = tick.xOffset ? `${tick.xOffset}px` : `${index * interval}%`
                        return (
                            <div
                                key={tick.value}
                                className="chart-axis-tick"
                                style={{
                                    '--xOffset': xOffset
                                }}
                            >
                                <div className="chart-axis-tick-label">
                                    {formatValue(tick.value, question)}
                                </div>
                            </div>
                        )
                    })}
                </div>
                {variant === 'bottom' && labelId && (
                    <div className="chart-axis-label">
                        <T k={labelId} />
                    </div>
                )}
            </div>
        </div>
    )
}

export default Axis
