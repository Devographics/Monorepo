import T from 'core/i18n/T'
import './Axis.scss'
import React from 'react'
import { FormatValueType, Tick } from './types'
import { QuestionMetadata } from '@devographics/types'
import Tooltip from 'core/components/Tooltip'

export const getInterval = (tickCount: number) => 100 / (tickCount - 1)

export type AxisProps = {
    variant: 'top' | 'bottom'
    ticks: Tick[]
    question?: QuestionMetadata
    label?: string
    formatValue: FormatValueType
    r2?: number
}

export const Axis = ({ variant, ticks, question, label, formatValue, r2 }: AxisProps) => {
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
                {variant === 'bottom' && label && (
                    <div className={`chart-axis-bottom chart-axis-bottom-${r2 && 'r2'}`}>
                        {r2 && <span className="chart-axis-placeholder" />}
                        <span className="chart-axis-label">{label}</span>
                        {r2 && (
                            <Tooltip
                                contents={
                                    <T
                                        k="charts.axis_legends.r2.description"
                                        values={{ r2: r2.toFixed(2) }}
                                    />
                                }
                                trigger={
                                    <span className="chart-axis-r2">
                                        <T
                                            k="charts.axis_legends.r2"
                                            values={{ r2: r2.toFixed(2) }}
                                        />
                                    </span>
                                }
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Axis
