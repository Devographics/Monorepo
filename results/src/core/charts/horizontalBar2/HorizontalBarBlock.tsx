import React from 'react'
import './HorizontalBar.scss'

import {
    FeaturesOptions,
    ResponseData,
    ResultsSubFieldEnum,
    SimplifiedSentimentOptions,
    StandardQuestionData
} from '@devographics/types'
import { MultiItemsExperienceControls } from '../multiItemsExperience/MultiItemsControls'
import { useChartState, useChartValues } from '../multiItemsExperience/helpers'
import { useI18n } from '@devographics/react-i18n'
import Rows from '../common2/Rows'
import { Row } from './HorizontalBarRow'
import { BlockComponentProps } from 'core/types'
import { DataSeries } from 'core/filters/types'
import Metadata from '../common2/Metadata'
import Controls from '../common2/Controls'
import Legend from '../common2/Legend'
import SeriesHeading from '../common2/SeriesHeading'
import max from 'lodash/max'

export const sortOptions = {
    experience: Object.values(FeaturesOptions),
    sentiment: Object.values(SimplifiedSentimentOptions)
}

export interface HorizontalBarBlock2Props extends BlockComponentProps {
    data: StandardQuestionData
    series: DataSeries<StandardQuestionData>[]
}

export const getChartCurrentEdition = ({
    data,
    series,
    block
}: Pick<HorizontalBarBlock2Props, 'data' | 'series' | 'block'>) => {
    const subField = block?.queryOptions?.subField || ResultsSubFieldEnum.RESPONSES
    // TODO: ideally blocks should always receive either a single series, or an array of series
    const defaultSeries = data || series[0].data
    const { currentEdition } = defaultSeries[subField] as ResponseData
    return currentEdition
}

export const getChartCompletion = ({
    data,
    series,
    block
}: Pick<HorizontalBarBlock2Props, 'data' | 'series' | 'block'>) => {
    const currentEdition = getChartCurrentEdition({ data, series, block })
    return currentEdition.completion
}
export const getChartBuckets = ({
    data,
    series,
    block
}: Pick<HorizontalBarBlock2Props, 'data' | 'series' | 'block'>) => {
    const currentEdition = getChartCurrentEdition({ data, series, block })
    return currentEdition.buckets
}

export const HorizontalBarBlock2 = (props: HorizontalBarBlock2Props) => {
    const { block } = props
    console.log(props)

    const buckets = getChartBuckets(props)
    const completion = getChartCompletion(props)
    console.log(buckets)

    const { getString } = useI18n()
    const chartState = useChartState()
    const className = `foo`

    const chartValues = useChartValues(buckets, chartState)

    const controls = [
        {
            id: 'foo',
            onClick: () => {
                return
            }
        }
    ]

    return (
        <div className={className}>
            <Controls />
            <SeriesHeading />
            <Legend />
            <Rows>
                {buckets.map((bucket, i) => (
                    <Row
                        key={bucket.id}
                        bucket={bucket}
                        chartState={chartState}
                        chartValues={chartValues}
                    />
                ))}
            </Rows>
            <Metadata completion={completion} />
            {/* <pre>
                <code>{JSON.stringify(buckets, null, 2)}</code>
            </pre> */}
        </div>
    )
}

export default HorizontalBarBlock2
