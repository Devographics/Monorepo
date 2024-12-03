import T from 'core/i18n/T'
import './AxisV.scss'
import React from 'react'
import max from 'lodash/max'
import round from 'lodash/round'
import { ChartState, FormatValueType, Tick } from './types'
import { QuestionMetadata } from '@devographics/types'

// export const getTicks = (values: number[]) => {
//     const NUMBER_OF_TICKS = 5
//     const maxValue = max(values) || 0
//     const ticks = [...Array(NUMBER_OF_TICKS + 1)].map(
//         (a, i) => ({ value: round((i * maxValue) / NUMBER_OF_TICKS) }),
//         1
//     )
//     return ticks
// }

export const getInterval = (tickCount: number) => 100 / (tickCount - 1)

export const AxisV = ({
    variant,
    ticks,
    question,
    labelId,
    formatValue,
    chartState
}: {
    variant: 'left' | 'right'
    ticks: Tick[]
    question: QuestionMetadata
    labelId?: string
    formatValue: FormatValueType
    chartState: ChartState
}) => {
    const interval = getInterval(ticks.length)

    return (
        <div className={`chart-axis chart-axis-vertical chart-axis-${variant}`}>
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
                                    '--xOffset': xOffset,
                                    '--order': index + 1
                                }}
                            >
                                <div className="chart-axis-tick-label">
                                    {formatValue(tick.value, question, chartState)}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default AxisV
