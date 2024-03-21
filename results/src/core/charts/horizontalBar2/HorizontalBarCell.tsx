import React from 'react'
import { ChartValues } from '../multiItemsExperience/types'
import Tooltip from 'core/components/Tooltip'
import { Bucket, FacetBucket } from '@devographics/types'
import { ChartState } from './types'
import { useColor } from './helpers/colors'
import T from 'core/i18n/T'
import { getItemLabel } from 'core/helpers/labels'
import { useI18n } from '@devographics/react-i18n'
import { formatValue } from './helpers/labels'
import { getViewDefinition } from './helpers/views'

export const Cell = ({
    bucket,
    chartState,
    chartValues,
    width,
    offset,
    cellIndex
}: {
    bucket: Bucket | FacetBucket
    chartState: ChartState
    chartValues: ChartValues
    width: number
    offset: number
    cellIndex: number
}) => {
    const { question, facetQuestion } = chartValues
    const viewDefinition = getViewDefinition(chartState.view)
    const { getValue } = viewDefinition
    const color = useColor({ id: bucket.id, question: facetQuestion })
    const { getString } = useI18n()

    const { id, count, entity } = bucket
    const value = getValue(bucket)
    const style = {
        '--percentageValue': value,
        '--width': width,
        '--offset': offset,
        '--color': color
    }

    const { key, label } = getItemLabel({
        getString,
        i18nNamespace: facetQuestion?.id || question.id,
        id,
        entity
    })

    // TODO: base this on actual size of element
    const showValue = value > 8

    const v = <span>{formatValue({ value, chartState, question: facetQuestion || question })}</span>

    return (
        <Tooltip
            trigger={
                <div className="horizontal-chart-cell" style={style}>
                    {showValue && v}
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
