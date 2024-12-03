import './Columns.scss'
import React from 'react'
import { Tick } from '../../common2/types'
import AxisV from '../../common2/AxisV'
import { BasicPointData, VerticalBarChartValues, VerticalBarViewDefinition } from '../types'
import { Gridlines } from './Gridlines'
import T from 'core/i18n/T'

type ColumnsComponentProps<SerieData, PointData extends BasicPointData, ChartStateType> = {
    chartState: ChartStateType
    chartValues: VerticalBarChartValues
    children: React.ReactNode
    viewDefinition: VerticalBarViewDefinition<SerieData, PointData, ChartStateType>
    ticks?: Tick[]
    labelId?: string
    hasZebra?: boolean
}

export const Columns = <SerieData, PointData extends BasicPointData, ChartStateType>({
    chartState,
    chartValues,
    children,
    labelId,
    viewDefinition
}: ColumnsComponentProps<SerieData, PointData, ChartStateType>) => {
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
