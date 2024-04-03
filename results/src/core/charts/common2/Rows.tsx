import './Rows.scss'
import React from 'react'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { Gridlines } from './Gridlines'
import Axis from './Axis'
import { Bucket } from '@devographics/types'

export const Rows = ({
    children,
    ticks,
    formatValue,
    labelId,
    hasZebra = false
}: {
    children: React.ReactNode
    ticks?: number[]
    labelId?: string
    formatValue?: (v: number) => string
    hasZebra: boolean
}) => {
    const [parent, enableAnimations] = useAutoAnimate(/* optional config */)
    return (
        <div className={`chart-rows ${hasZebra ? 'chart-rows-zebra' : ''}`}>
            {ticks && formatValue && <Axis variant="top" ticks={ticks} formatValue={formatValue} />}

            <div className="chart-rows-content">
                <div className="chart-rows-bars" ref={parent}>
                    {children}
                </div>
                {ticks && <Gridlines ticks={ticks} />}
                {/* {buckets && <Zebra buckets={buckets} />} */}
            </div>
            {ticks && formatValue && labelId && (
                <Axis variant="bottom" ticks={ticks} formatValue={formatValue} labelId={labelId} />
            )}
        </div>
    )
}

export default Rows
