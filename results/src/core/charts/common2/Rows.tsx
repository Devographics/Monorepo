import './Rows.scss'
import React from 'react'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { Gridlines } from './Gridlines'
import Axis from './Axis'
import { Bucket } from '@devographics/types'

export const Rows = ({
    children,
    buckets,
    ticks,
    formatValue,
    labelId
}: {
    children: React.ReactNode
    buckets: Bucket[]
    ticks?: number[]
    labelId: string
    formatValue: (v: number) => string
}) => {
    const [parent, enableAnimations] = useAutoAnimate(/* optional config */)
    return (
        <div className="chart-rows" ref={parent}>
            {ticks && (
                <Axis variant="top" ticks={ticks} formatValue={formatValue} labelId={labelId} />
            )}

            <div className="chart-rows-content">
                <div className="chart-rows-bars">{children}</div>
                {ticks && <Gridlines ticks={ticks} />}
                {/* {buckets && <Zebra buckets={buckets} />} */}
            </div>
            {ticks && (
                <Axis variant="bottom" ticks={ticks} formatValue={formatValue} labelId={labelId} />
            )}
        </div>
    )
}

export default Rows
