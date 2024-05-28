import './Columns.scss'
import React from 'react'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import Axis from './Axis'
import { ShowAll } from './ShowAll'
import { ChartState } from '../horizontalBar2/types'
import { ChartValues } from '../multiItemsExperience/types'
import { Tick } from './types'

export const Columns = ({
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
    ticks?: Tick[]
    labelId?: string
    formatValue?: (v: number) => string
    hasZebra?: boolean
}) => {
    return (
        <div className="chart-columns">
            {/* {ticks && formatValue && <Axis variant="top" ticks={ticks} formatValue={formatValue} />} */}

            {children}

            {/* {ticks && formatValue && labelId && (
                <Axis variant="bottom" ticks={ticks} formatValue={formatValue} labelId={labelId} />
            )} */}
        </div>
    )
}

export default Columns
