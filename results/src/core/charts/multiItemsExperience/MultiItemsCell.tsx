import React from 'react'
import { FeaturesOptions, SimplifiedSentimentOptions } from '@devographics/types'
import {
    ChartState,
    ColumnId,
    CombinedBucket,
    Totals,
    experienceColors,
    sentimentColors
} from './types'

export const Cell = ({
    combinedBucket,
    chartState,
    width,
    offset
}: {
    combinedBucket: CombinedBucket
    chartState: ChartState
    width: number
    offset: number
}) => {
    const { variable } = chartState
    const { bucket, facetBucket } = combinedBucket
    const value = facetBucket[variable]
    const style = {
        '--percentageValue': value,
        '--experienceColor': experienceColors[bucket.id as FeaturesOptions],
        '--sentimentColor': sentimentColors[facetBucket.id as SimplifiedSentimentOptions],
        '--width': width,
        '--offset': offset
    }
    return (
        <div className="multiexp-cell" style={style}>
            <div className="multiexp-cell-box">
                <div className="multiexp-cell-segment multiexp-cell-segment-experience"></div>
                <div className="multiexp-cell-segment multiexp-cell-segment-sentiment"></div>
            </div>
            {/* <div>{combinedBucket.id}</div> */}
            {/* <div>{value}%</div> */}
        </div>
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
