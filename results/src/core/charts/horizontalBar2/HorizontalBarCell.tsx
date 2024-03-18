import React from 'react'
import { ChartValues, ColumnId, CombinedBucket, Totals } from '../multiItemsExperience/types'
import Tooltip from 'core/components/Tooltip'
import { useI18n } from '@devographics/react-i18n'
import { Bucket, FacetBucket } from '@devographics/types'
import { ChartState } from './types'
import { getIsPercentage, getValue } from './helpers/other'
import { useColor } from './helpers/colors'

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
    const { facetQuestion } = chartValues

    const color = useColor({ id: bucket.id, question: facetQuestion })
    // const { getString } = useI18n()

    const value = getValue(bucket, chartState)
    const showPercentage = getIsPercentage(chartState)
    const style = {
        '--percentageValue': value,
        '--width': width,
        '--offset': offset,
        '--color': color
    }

    return (
        <Tooltip
            trigger={
                <div className="horizontal-chart-cell" style={style}>
                    {color}
                    {value}
                    {showPercentage && '%'}
                </div>
            }
            contents={
                <div>
                    {bucket.id}
                    {/* <T
                        k={`charts.multiexp.cell_tooltip.grouped_by_${grouping}`}
                        values={values}
                        html={true}
                        md={true}
                    /> */}
                </div>
            }
        />
    )
}
