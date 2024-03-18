import React from 'react'
import './HorizontalBar.scss'

import { useI18n } from '@devographics/react-i18n'
import Rows from '../common2/Rows'
import { Row } from './HorizontalBarRow'
import Metadata from '../common2/Metadata'
import Controls from '../common2/Controls'
import Legend from '../common2/Legend'
import SeriesHeading from '../common2/SeriesHeading'
import { BlockComponentProps } from 'core/types'
import { StandardQuestionData } from '@devographics/types'
import { DataSeries } from 'core/filters/types'
import { getChartBuckets, getChartCompletion, useQuestionMetadata } from './helpers/other'
import { useChartState } from './helpers/chartState'
import { useChartValues } from './helpers/chartValues'
import { getControls } from './helpers/controls'

export interface HorizontalBarBlock2Props extends BlockComponentProps {
    data: StandardQuestionData
    series: DataSeries<StandardQuestionData>[]
}

export const HorizontalBarBlock2 = (props: HorizontalBarBlock2Props) => {
    const { block, question } = props
    // console.log(props)

    const buckets = getChartBuckets(props)
    const completion = getChartCompletion(props)
    const facet = block?.filtersState?.facet

    const facetQuestion = useQuestionMetadata(facet)

    // const { getString } = useI18n()
    const chartState = useChartState({ facetQuestion })
    const className = `foo`

    const chartValues = useChartValues({ buckets, chartState, block, question })
    const controls = getControls({ chartState, chartValues })

    return (
        <div className={className}>
            <pre>
                <code>{JSON.stringify(chartState, null, 2)}</code>
            </pre>
            <Controls controls={controls} chartState={chartState} />
            <SeriesHeading />
            <Legend />
            <Rows>
                {buckets.map((bucket, i) => (
                    <Row
                        key={bucket.id}
                        bucket={bucket}
                        chartState={chartState}
                        chartValues={chartValues}
                        block={block}
                    />
                ))}
            </Rows>
            <Metadata completion={completion} />
            {/* <pre>
                <code>{JSON.stringify(buckets, null, 2)}</code>
            </pre> */}

            {/* <pre>
                <code>{JSON.stringify(chartValues, null, 2)}</code>
            </pre> */}
        </div>
    )
}

export default HorizontalBarBlock2
