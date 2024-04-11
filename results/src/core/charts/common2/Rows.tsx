import './Rows.scss'
import React from 'react'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { Gridlines } from './Gridlines'
import Axis from './Axis'
import { Bucket } from '@devographics/types'
import { ShowAll } from './ShowAll'
import { ChartState } from '../horizontalBar2/types'
import { ChartValues } from '../multiItemsExperience/types'

export const Rows = ({
    chartState,
    chartValues,
    children,
    ticks,
    formatValue,
    labelId,
    hasZebra = false
}: {
    chartState: ChartState
    chartValues: ChartValues
    children: React.ReactNode
    ticks?: number[]
    labelId?: string
    formatValue?: (v: number) => string
    hasZebra?: boolean
}) => {
    const [parent, enableAnimations] = useAutoAnimate(/* optional config */)
    return (
        <div className={`chart-rows ${hasZebra ? 'chart-rows-zebra' : ''}`}>
            {ticks && formatValue && <Axis variant="top" ticks={ticks} formatValue={formatValue} />}

            <div className="chart-rows-content">
                {ticks && <Gridlines ticks={ticks} />}
                {/* {buckets && <Zebra buckets={buckets} />} */}
                <div className="chart-rows-bars" ref={parent}>
                    {children}
                </div>

                {chartState.rowsLimit ? (
                    <ShowAll chartState={chartState} chartValues={chartValues} />
                ) : null}
            </div>
            {ticks && formatValue && labelId && (
                <Axis variant="bottom" ticks={ticks} formatValue={formatValue} labelId={labelId} />
            )}
        </div>
    )
}

export default Rows
