import React from 'react'
import { MultiItemSerie, Totals } from './types'
import { combineItems, getItemTotals } from './helpers'
import { CommonProps } from '../common2/types'
import { MultiItemsChartState } from './types'
import { allColumnIds } from './MultiItemsSerie'
import { FeaturesOptions, SimplifiedSentimentOptions } from '@devographics/types'
import sum from 'lodash/sum.js'
import { formatPercentage } from 'core/explorer/helpers'
import T from 'core/i18n/T'
import { AverageIcon } from 'core/icons'

export const MultiItemsStats = ({
    series,
    chartState
}: {
    series: MultiItemSerie[]
} & CommonProps<MultiItemsChartState>) => {
    const { variable, filter } = chartState

    const statsItems = [
        FeaturesOptions.USED,
        SimplifiedSentimentOptions.POSITIVE_SENTIMENT,
        SimplifiedSentimentOptions.NEGATIVE_SENTIMENT
    ]
    const serie = series[0]
    const items = serie.data

    // combine/flatten each item's buckets
    let combinedItems = combineItems({ items, variable })

    // filter items if needed
    if (filter) {
        combinedItems = combinedItems.filter(i => i._metadata.sectionId === filter)
    }

    // get column-by-column grouped totals
    const groupedTotals = getItemTotals({ combinedItems, columnIds: allColumnIds })

    return (
        <div className="chart-metadata">
            {statsItems.map(statsItem => (
                <StatItem key={statsItem} itemId={statsItem} groupedTotals={groupedTotals} />
            ))}
        </div>
    )
}

const StatItem = ({
    itemId,
    groupedTotals
}: {
    itemId: FeaturesOptions | SimplifiedSentimentOptions
    groupedTotals: Totals[]
}) => {
    const allTotals = groupedTotals.map(item => item[itemId])
    const totalsSum = sum(allTotals)
    const average = totalsSum / allTotals.length
    return (
        <div className="chart-metadata-item">
            <AverageIcon size="petite" />
            <span className="chart-metadata-item-label">
                <T k={`charts.average.${itemId}`} />:
            </span>
            <span className="chart-metadata-item-value">{formatPercentage(average)}%</span>
        </div>
    )
}
