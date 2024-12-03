import './Columns.scss'
import React from 'react'
import { Tick } from '../../common2/types'
import AxisV from '../../common2/AxisV'
import { VerticalBarChartState, VerticalBarChartValues } from '../types'
import { Gridlines } from './Gridlines'
import T from 'core/i18n/T'
import { getViewComponent } from '../helpers/views'

export const Columns = ({
    chartState,
    chartValues,
    children,
    labelId,
    hasZebra = false
}: {
    chartState: VerticalBarChartState
    chartValues: VerticalBarChartValues
    children: React.ReactNode
    ticks?: Tick[]
    labelId?: string
    hasZebra?: boolean
}) => {
    const { view } = chartState
    const viewDefinition = getViewComponent(view)
    const { formatValue } = viewDefinition
    const { question, ticks, totalColumns } = chartValues
    const style = { '--totalColumns': totalColumns }
    const axisProps = { question, labelId, formatValue, chartState }

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
