import React, { useEffect, useRef, useState } from 'react'
import { MultiItemsChartValues } from '../multiItemsExperience/types'
import Tooltip from 'core/components/Tooltip'
import { Bucket, FacetBucket } from '@devographics/types'
import { VerticalBarChartState } from './types'
import { useI18n } from '@devographics/react-i18n'
import { formatValue } from '../horizontalBar2/helpers/labels'
import { useWidth } from '../common2/helpers'
import { CellLabel } from '../common2'
import max from 'lodash/max'

// hide labels for cells under this size
export const MINIMUM_CELL_SIZE_TO_SHOW_LABEL = 30

export const useIsWideEnough = () => {
    const ref = useRef<HTMLDivElement>(null)
    const cellWidth = useWidth(ref)
    const [isWideEnough, setIsWideEnough] = useState(false)

    useEffect(() => {
        setIsWideEnough(!!(cellWidth && cellWidth > MINIMUM_CELL_SIZE_TO_SHOW_LABEL))
    }, [cellWidth])
    return { ref, isWideEnough, cellWidth }
}

export const Cell = ({
    edition,
    value,
    chartState,
    chartValues,
    width,
    height,
    offset,
    cellIndex,
    gradient
}: {
    bucket: Bucket | FacetBucket
    chartState: VerticalBarChartState
    chartValues: MultiItemsChartValues
    width: number
    offset: number
    cellIndex: number
    gradient: string[]
}) => {
    const { ref, isWideEnough: showLabel } = useIsWideEnough()

    // const entities = useEntities()
    // const entity = entities.find(e => e.id === bucket.id)
    const { question, facetQuestion, ticks } = chartValues
    const { getString } = useI18n()

    const style = {
        '--color1': gradient[0],
        '--color2': gradient[1],
        '--height': height,
        '--offset': offset
    }

    const v = formatValue({ value, chartState, question: facetQuestion || question })

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
