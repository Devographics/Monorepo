import React from 'react'
import { FeaturesOptions, SimplifiedSentimentOptions } from '@devographics/types'
import { ChartState, ColumnId, CombinedBucket, GroupingOptions, Totals } from './types'
import Tooltip from 'core/components/Tooltip'
import { useI18n } from '@devographics/react-i18n'
import T from 'core/i18n/T'
import { useTheme } from 'styled-components'

export const Cell = ({
    combinedBucket,
    chartState,
    width,
    offset,
    groupedTotals
}: {
    combinedBucket: CombinedBucket
    chartState: ChartState
    width: number
    offset: number
    groupedTotals: Totals
}) => {
    const theme = useTheme()
    const { getString } = useI18n()
    const { variable } = chartState
    const { bucket, facetBucket } = combinedBucket

    const value = facetBucket[variable] || 0
    const experienceKey = `options.experience.${bucket.id}.label.short`
    const sentimentKey = `options.sentiment.${facetBucket.id}.label.short`

    const values = {
        value,
        experience: getString(experienceKey)?.t || '?',
        sentiment: getString(sentimentKey)?.t || '?'
    }

    const experienceColors = theme.colors.ranges.features
    const sentimentColors = theme.colors.ranges.sentiment

    const style = {
        '--percentageValue': value,
        '--experienceColor1': experienceColors[bucket.id as FeaturesOptions][0],
        '--experienceColor2': experienceColors[bucket.id as FeaturesOptions][0],
        '--sentimentColor1': sentimentColors[facetBucket.id as SimplifiedSentimentOptions][0],
        '--sentimentColor2': sentimentColors[facetBucket.id as SimplifiedSentimentOptions][0],
        '--width': width,
        '--offset': offset
    }

    const isNeutral = facetBucket.id === SimplifiedSentimentOptions.NEUTRAL_SENTIMENT

    return (
        <Tooltip
            trigger={
                <div className="multiexp-cell chart-cell" style={style}>
                    <div className="multiexp-cell-segment multiexp-cell-segment-experience"></div>

                    {!isNeutral && (
                        <div className="multiexp-cell-segment multiexp-cell-segment-sentiment"></div>
                    )}
                </div>
            }
            contents={
                <div>
                    <T
                        k={
                            isNeutral
                                ? `charts.multiexp.cell_tooltip_neutral`
                                : `charts.multiexp.cell_tooltip`
                        }
                        values={values}
                        html={true}
                        md={true}
                    />
                </div>
            }
        />
    )
}

export const ColumnTotal = ({
    columnId,
    groupedTotals,
    width,
    offset
}: {
    columnId: ColumnId
    groupedTotals: Totals
    width: number
    offset: number
}) => {
    const style = {
        '--width': width,
        '--offset': offset
    }
    const columnTotal = groupedTotals[columnId]
    return (
        <div className="multiexp-column-total" style={style}>
            <div className="multiexp-column-total-border" />
            {columnTotal > 3 && <div className="multiexp-column-total-value">{columnTotal}%</div>}
        </div>
    )
}
