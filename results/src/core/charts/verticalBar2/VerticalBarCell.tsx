import React, { useEffect, useRef, useState } from 'react'
import Tooltip from 'core/components/Tooltip'
import { ResponseEditionData } from '@devographics/types'
import {
    BasicPointData,
    VerticalBarChartState,
    VerticalBarChartValues,
    VerticalBarViewDefinition
} from './types'
import { useHeight } from '../common2/helpers'
import { CellLabel } from '../common2'
import { getViewComponent, getViewDefinition } from './helpers/views'

// hide labels for cells under this height
export const MINIMUM_CELL_SIZE_TO_SHOW_LABEL = 20

export const useIsTallEnough = () => {
    const ref = useRef<HTMLDivElement>(null)
    const cellHeight = useHeight(ref)
    const [isTallEnough, setIsTallEnough] = useState(false)

    useEffect(() => {
        setIsTallEnough(!!(cellHeight && cellHeight > MINIMUM_CELL_SIZE_TO_SHOW_LABEL))
    }, [cellHeight])
    return { ref, cellHeight, isTallEnough }
}

type CellProps<SerieData, PointData extends BasicPointData, ChartStateType> = {
    cellId?: string
    point: PointData
    value: number
    chartState: ChartStateType
    chartValues: VerticalBarChartValues
    height: number
    offset: number
    cellIndex: number
    gradient: string[]
    viewDefinition: VerticalBarViewDefinition<SerieData, PointData, ChartStateType>
}

export const Cell = <SerieData, PointData extends BasicPointData, ChartStateType>({
    cellId,
    point,
    value,
    chartState,
    chartValues,
    height,
    offset,
    viewDefinition,
    cellIndex,
    gradient
}: CellProps<SerieData, PointData, ChartStateType>) => {
    const { ref, cellHeight, isTallEnough: showLabel } = useIsTallEnough()
    const { highlighted } = chartState
    const isHighlighted = highlighted === cellId
    const style = {
        '--color1': gradient[0],
        '--color2': gradient[1],
        '--height': height,
        '--offset': offset
    }

    const { question } = chartValues
    const { formatValue } = viewDefinition

    const v = formatValue(value, question, chartState)

    const label = cellId ? `${point.columnId} ${cellId}` : point.columnId
    return (
        <Tooltip
            trigger={
                <div
                    data-id={cellId}
                    data-value={value}
                    className={`chart-cell vertical-chart-cell chart-cell-${
                        isHighlighted ? 'highlighted' : 'notHighlighted'
                    }`}
                    style={style}
                    ref={ref}
                >
                    {showLabel && <CellLabel label={String(v)} />}
                </div>
            }
            contents={
                <div>
                    {label}: <strong>{v}</strong>{' '}
                </div>
            }
            showBorder={false}
        />
    )
}
