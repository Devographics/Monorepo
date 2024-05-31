import './Lines.scss'
import React from 'react'
import { Tick } from '../../common2/types'
import AxisV from '../../common2/AxisV'
import { LinesComponentProps, VerticalBarChartState, VerticalBarChartValues } from '../types'

export const Lines = ({ chartState, chartValues, editions }: LinesComponentProps) => {
    const { viewDefinition } = chartState
    const { formatValue } = viewDefinition
    const { question, ticks, totalColumns } = chartValues
    const style = { '--totalColumns': totalColumns }
    const axisProps = { question, labelId, formatValue }

    return (
        <div className="chart-columns-lines">
            <svg></svg>
        </div>
    )
}
