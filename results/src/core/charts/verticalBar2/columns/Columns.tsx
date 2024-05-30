import './Columns.scss'
import React from 'react'
import { Tick } from '../../common2/types'
import AxisV from '../../common2/AxisV'
import { VerticalBarChartState, VerticalBarChartValues } from '../types'
import { Gridlines } from './Gridlines'

export const Columns = ({
    chartState,
    chartValues,
    children,
    formatValue,
    labelId,
    hasZebra = false
}: {
    chartState: VerticalBarChartState
    chartValues: VerticalBarChartValues
    children: React.ReactNode
    ticks?: Tick[]
    labelId?: string
    formatValue?: (v: number) => string
    hasZebra?: boolean
}) => {
    const { ticks, totalColumns } = chartValues
    const style = { '--totalColumns': totalColumns }

    return (
        <div className="chart-columns-wrapper">
            <div className="chart-columns" style={style}>
                {ticks && <Gridlines ticks={ticks} />}

                {ticks && (
                    <AxisV
                        variant="left"
                        ticks={ticks}
                        formatValue={formatValue}
                        labelId={labelId}
                    />
                )}
                {children}

                {ticks && (
                    <AxisV
                        variant="right"
                        ticks={ticks}
                        formatValue={formatValue}
                        labelId={labelId}
                    />
                )}
            </div>
        </div>
    )
}

export default Columns
