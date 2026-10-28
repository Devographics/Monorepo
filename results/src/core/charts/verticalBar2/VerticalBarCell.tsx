import React, { useEffect, useRef, useState } from 'react'
import { usePageContext } from 'core/helpers/pageContext'
import Tooltip from 'core/components/Tooltip'
import { Entity, ResponseEditionData } from '@devographics/types'
import {
    BasicPointData,
    VerticalBarChartState,
    VerticalBarChartValues,
    VerticalBarViewDefinition
} from './types'
import { useHeight } from '../common2/helpers'
import { CellLabel } from '../common2'
import { getViewComponent, getViewDefinition } from './helpers/views'
import { getItemLabel } from 'core/helpers/labels'
import { useI18n } from '@devographics/react-i18n'
import { BlockVariantDefinition } from 'core/types'
import { HighlightIds, useHighlight } from 'core/components/Highlight'

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
    // ids used to highlight this cell from takeaway datapoints (stacked columns only)
    highlightIds?: HighlightIds
}

export const Cell = <SerieData, PointData extends BasicPointData, ChartStateType>(
    props: CellProps<SerieData, PointData, ChartStateType> & {
        block: BlockVariantDefinition
        entity: Entity
    }
) => {
    const {
        block,
        entity,
        cellId,
        point,
        value,
        chartState,
        chartValues,
        height,
        offset,
        viewDefinition,
        cellIndex,
        gradient,
        highlightIds
    } = props
    const { getString } = useI18n()

    const { i18nNamespace } = block
    const { ref, cellHeight, isTallEnough: showLabel } = useIsTallEnough()
    const { highlighted } = chartState
    const isHighlighted = highlighted === cellId
    // the tooltip trigger must be the DOM element itself, so we use the hook
    // rather than wrapping it in <Highlight>
    const highlight = useHighlight(highlightIds)
    const style = {
        '--color1': gradient[0],
        '--color2': gradient[1],
        '--height': height,
        '--offset': offset
    }

    const { question } = chartValues
    const { formatValue } = viewDefinition
    const { localeId } = usePageContext()

    const v = formatValue({ value, question, chartState, localeId })

    let label = point.columnId
    if (cellId) {
        const { label: cellLabel } = getItemLabel({
            id: cellId,
            entity,
            getString,
            i18nNamespace
        })
        label = `${point.columnId} ${cellLabel}`
    }
    return (
        <Tooltip
            trigger={
                <div
                    data-id={cellId}
                    data-value={value}
                    className={`chart-cell vertical-chart-cell chart-cell-${
                        isHighlighted ? 'highlighted' : 'notHighlighted'
                    } ${highlight.state ? `datapoint-${highlight.state}` : ''}`}
                    {...highlight.attributes}
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
