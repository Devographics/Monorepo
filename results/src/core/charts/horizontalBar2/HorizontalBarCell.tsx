import React, { useEffect, useRef, useState } from 'react'
import Tooltip from 'core/components/Tooltip'
import { Bucket, FacetBucket } from '@devographics/types'
import {
    HorizontalBarChartState,
    HorizontalBarChartValues,
    HorizontalBarViewDefinition
} from './types'
import T from 'core/i18n/T'
import { getItemLabel } from 'core/helpers/labels'
import { useI18n } from '@devographics/react-i18n'
import { useWidth } from '../common2/helpers'
import { CellLabel } from '../common2'
import { getViewDefinition } from './helpers/views'

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
    bucket,
    chartState,
    chartValues,
    width,
    offset,
    cellIndex,
    gradient,
    viewDefinition
}: {
    bucket: Bucket | FacetBucket
    chartState: HorizontalBarChartState
    chartValues: HorizontalBarChartValues
    width: number
    offset: number
    cellIndex: number
    gradient: string[]
    viewDefinition: HorizontalBarViewDefinition<HorizontalBarChartState>
}) => {
    const { ref, isWideEnough: showLabel } = useIsWideEnough()

    // const entities = useEntities()
    // const entity = entities.find(e => e.id === bucket.id)
    const { question, facetQuestion } = chartValues
    const { sort, view } = chartState
    const { getValue, formatValue } = viewDefinition
    const { getString } = useI18n()

    const { id, count, entity, token } = bucket
    const value = getValue(bucket)
    const style = {
        '--percentageValue': value,
        '--width': width,
        '--offset': offset,
        '--color1': gradient[0],
        '--color2': gradient[1]
    }

    const { key, label } = getItemLabel({
        getString,
        i18nNamespace: facetQuestion?.id || question?.id,
        id,
        entity
    })

    const v = formatValue(value)

    const isActiveSort = sort === id
    const className = `chart-cell horizontal-chart-cell ${isActiveSort ? 'active-sort' : ''}`

    return (
        <Tooltip
            trigger={
                <div className={className} style={style} ref={ref}>
                    {showLabel && <CellLabel label={v} />}
                </div>
            }
            contents={
                <div>
                    {label}: <strong>{v}</strong>{' '}
                    <T k="charts.facet_respondents" values={{ count }} />
                </div>
            }
            showBorder={false}
        />
    )
}
