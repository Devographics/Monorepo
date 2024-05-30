import './Rows.scss'
import React from 'react'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import Axis from '../../common2/Axis'
import { ShowAll } from '../../common2/ShowAll'
import { HorizontalBarViewProps } from '../types'

export const Rows = ({
    chartState,
    chartValues,
    children,
    formatValue,
    labelId,
    hasZebra = false
}: HorizontalBarViewProps & {
    children: React.ReactNode
    labelId?: string
    formatValue?: (v: number) => string
    hasZebra?: boolean
}) => {
    const [parent, enableAnimations] = useAutoAnimate(/* optional config */)
    const { ticks } = chartValues
    return (
        <div className={`chart-rows ${hasZebra ? 'chart-rows-zebra' : ''}`} ref={parent}>
            {ticks && formatValue && <Axis variant="top" ticks={ticks} formatValue={formatValue} />}

            {children}

            {chartState.rowsLimit ? (
                <ShowAll chartState={chartState} chartValues={chartValues} />
            ) : null}

            {ticks && formatValue && labelId && (
                <Axis variant="bottom" ticks={ticks} formatValue={formatValue} labelId={labelId} />
            )}
        </div>
    )
}

export default Rows
