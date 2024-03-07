import React from 'react'
import './MultiItemsExperience.scss'
import { FeaturesOptions, SimplifiedSentimentOptions } from '@devographics/types'
import { ChartState, CombinedBucket, experienceColors, sentimentColors } from './types'

export const Item = ({
    combinedBucket,
    chartState
}: {
    combinedBucket: CombinedBucket
    chartState: ChartState
}) => {
    const { variable } = chartState
    const { bucket, facetBucket } = combinedBucket
    const value = facetBucket[variable]
    const style = {
        '--percentageValue': value,
        '--experienceColor': experienceColors[bucket.id as FeaturesOptions],
        '--sentimentColor': sentimentColors[facetBucket.id as SimplifiedSentimentOptions]
    }
    return (
        <div className="multiexp-item" style={style}>
            <div className="multiexp-item-box">
                <div className="multiexp-item-segment multiexp-item-segment-experience"></div>
                <div className="multiexp-item-segment multiexp-item-segment-sentiment"></div>
            </div>
            {/* <div>{combinedBucket.id}</div> */}
            <div>{value}%</div>
        </div>
    )
}
