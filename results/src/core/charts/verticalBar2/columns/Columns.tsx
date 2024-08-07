import './Columns.scss'
import React from 'react'
import { ChartState, Tick } from '../../common2/types'
import AxisV from '../../common2/AxisV'
import { VerticalBarChartState, VerticalBarChartValues } from '../types'
import { Gridlines } from './Gridlines'
import T from 'core/i18n/T'

export const Columns = ({
    chartState,
    chartValues,
    children,
    labelId,
    hasZebra = false
}: {
    chartState: ChartState // keep generic here
    chartValues: VerticalBarChartValues
    children: React.ReactNode
    ticks?: Tick[]
    labelId?: string
    hasZebra?: boolean
}) => {
    const { viewDefinition } = chartState
    const { formatValue } = viewDefinition
    const { question, ticks, totalColumns } = chartValues
    const style = { '--totalColumns': totalColumns }
    const axisProps = { question, labelId, formatValue }

    return (
        <div className="chart-columns-wrapper">
            <div
                className={`chart-columns chart-columns-${labelId ? 'withLabel' : 'noLabel'}`}
                style={style}
            >
                {ticks && <Gridlines ticks={ticks} />}

                {ticks && <AxisV variant="left" {...axisProps} ticks={ticks} />}
                {children}
                {ticks && <AxisV variant="right" {...axisProps} ticks={ticks} />}
                {labelId && (
                    <div className="chart-axis-label">
                        <div>
                            <T k={labelId} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Columns
