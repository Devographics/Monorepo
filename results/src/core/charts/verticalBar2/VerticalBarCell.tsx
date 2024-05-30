import React, { useEffect, useRef, useState } from 'react'
import Tooltip from 'core/components/Tooltip'
import { ResponseEditionData } from '@devographics/types'
import { VerticalBarChartState, VerticalBarChartValues } from './types'
import { useHeight } from '../common2/helpers'
import { CellLabel } from '../common2'
import { getViewDefinition } from './helpers/views'

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

export const Cell = ({
    edition,
    value,
    chartState,
    chartValues,
    height,
    offset,
    cellIndex,
    gradient
}: {
    edition: ResponseEditionData
    value: number
    chartState: VerticalBarChartState
    chartValues: VerticalBarChartValues
    height: number
    offset: number
    cellIndex: number
    gradient: string[]
}) => {
    const { ref, cellHeight, isTallEnough: showLabel } = useIsTallEnough()

    const style = {
        '--color1': gradient[0],
        '--color2': gradient[1],
        '--height': height,
        '--offset': offset
    }

    const { question } = chartValues
    const { view } = chartState
    const viewDefinition = getViewDefinition(view)
    const { formatValue } = viewDefinition

    const v = formatValue(value, question)

    return (
        <Tooltip
            trigger={
                <div className="chart-cell vertical-chart-cell" style={style} ref={ref}>
                    {showLabel && <CellLabel label={v} />}
                </div>
            }
            contents={
                <div>
                    {edition.year}: <strong>{v}</strong>{' '}
                </div>
            }
            showBorder={false}
        />
    )
}
