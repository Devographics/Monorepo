import React from 'react'
import { FeaturesOptions, SimplifiedSentimentOptions } from '@devographics/types'
import {
    ChartState,
    ColumnId,
    CombinedBucket,
    GroupingOptions,
    Totals,
    experienceColors,
    sentimentColors
} from './types'
import Tooltip from 'core/components/Tooltip'
import { useI18n } from '@devographics/react-i18n'
import T from 'core/i18n/T'

export const Cell = ({
    combinedBucket,
    chartState,
    width,
    offset,
    groupedTotals,
    columnId
}: {
    combinedBucket: CombinedBucket
    chartState: ChartState
    width: number
    offset: number
    groupedTotals: Totals
    columnId: ColumnId
}) => {
    const { getString } = useI18n()
    const { variable, grouping } = chartState
    // the "subgrouping" is whichever GroupingOption is not the currently selected grouping
    const subGrouping = Object.values(GroupingOptions).find(g => g !== grouping)
    const { bucket, facetBucket } = combinedBucket
    const parentValue = groupedTotals[columnId]
    const value = facetBucket[variable] || 0
    // little bit hacky: we need to look in two different places depending on
    // which grouping is enabled
    const answerId = grouping === GroupingOptions.EXPERIENCE ? facetBucket.id : bucket.id
    const values = {
        parentValue,
        parentAnswer: getString(`options.${grouping}.${columnId}.label.short`)?.t || '?',
        value,
        answer: getString(`options.${subGrouping}.${answerId}.label.short`)?.t || '?'
    }

    const style = {
        '--percentageValue': value,
        '--experienceColor': experienceColors[bucket.id as FeaturesOptions],
        '--sentimentColor': sentimentColors[facetBucket.id as SimplifiedSentimentOptions],
        '--width': width,
        '--offset': offset
    }

    return (
        <Tooltip
            trigger={
                <div className="multiexp-cell" style={style}>
                    <div className="multiexp-cell-segment multiexp-cell-segment-experience"></div>
                    <div className="multiexp-cell-segment multiexp-cell-segment-sentiment"></div>
                </div>
            }
            contents={
                <div>
                    <T
                        k={`charts.multiexp.cell_tooltip.grouped_by_${grouping}`}
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
    return (
        <div className="multiexp-column-total" style={style}>
            <div className="multiexp-column-total-border" />
            <div className="multiexp-column-total-value">{groupedTotals[columnId]}%</div>
        </div>
    )
}
