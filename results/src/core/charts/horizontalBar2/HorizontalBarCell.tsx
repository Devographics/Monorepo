import React, { useEffect, useRef, useState } from 'react'
import { ChartValues } from '../multiItemsExperience/types'
import Tooltip from 'core/components/Tooltip'
import { Bucket, FacetBucket } from '@devographics/types'
import { ChartState } from './types'
import T from 'core/i18n/T'
import { getItemLabel } from 'core/helpers/labels'
import { useI18n } from '@devographics/react-i18n'
import { formatValue } from './helpers/labels'
import { getViewDefinition } from './helpers/views'
import { useWidth } from '../common2/helpers'

// hide labels for cells under this size
const MINIMUM_CELL_SIZE_TO_SHOW_LABEL = 30

export const Cell = ({
    bucket,
    chartState,
    chartValues,
    width,
    offset,
    cellIndex,
    gradient
}: {
    bucket: Bucket | FacetBucket
    chartState: ChartState
    chartValues: ChartValues
    width: number
    offset: number
    cellIndex: number
    gradient: string[]
}) => {
    const ref = useRef<HTMLDivElement>(null)
    const cellWidth = useWidth(ref)
    const [showLabel, setShowLabel] = useState(false)

    useEffect(() => {
        setShowLabel(!!(cellWidth && cellWidth > MINIMUM_CELL_SIZE_TO_SHOW_LABEL))
    }, [cellWidth])

    const { question, facetQuestion } = chartValues
    const viewDefinition = getViewDefinition(chartState.view)
    const { getValue } = viewDefinition
    const { getString } = useI18n()

    const { id, count, entity } = bucket
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
        i18nNamespace: facetQuestion?.id || question.id,
        id,
        entity
    })

    const v = <span>{formatValue({ value, chartState, question: facetQuestion || question })}</span>

    return (
        <Tooltip
            trigger={
                <div className="chart-cell horizontal-chart-cell" style={style} ref={ref}>
                    {showLabel && v}
                </div>
            }
            contents={
                <div>
                    {label}: <strong>{v}</strong>{' '}
                    <T k="charts.facet_respondents" values={{ count }} />
                </div>
            }
        />
    )
}
