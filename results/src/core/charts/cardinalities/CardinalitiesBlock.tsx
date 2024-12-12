import React from 'react'
import { StandardQuestionData } from '@devographics/types'
import { ChartControls, ChartFooter, ChartWrapper, GridWrapper, Note } from '../common2'
import { CommonProps } from '../common2/types'
import ChartData from '../common2/ChartData'
import ChartShare from '../common2/ChartShare'
import { BackToBack } from '../common2/BackToBack'
import { DataSeries } from 'core/filters/types'
import { CardinalitiesSerie } from './CardinalitiesSerie'
import { BlockComponentProps } from 'core/types'
import { useChartState } from './helpers/chartState'
import { CardinalitiesChartState } from './types'
import { getSeriesMetadata } from './helpers/other'
import { getViewDefinition } from './helpers/views'
import ViewSwitcher from './ViewSwitcher'
import './Cardinalities.scss'

type CardinalitiesBlockProps = BlockComponentProps & {
    series: DataSeries<StandardQuestionData[]>[]
}

export const CardinalitiesBlock = (props: CardinalitiesBlockProps) => {
    const { block, series, question, pageContext, variant } = props

    const chartState = useChartState()

    const viewDefinition = getViewDefinition(chartState.view)

    const seriesMetadata = getSeriesMetadata({
        series,
        block,
        chartState,
        viewDefinition
    })

    const commonProps: CommonProps<CardinalitiesChartState> = {
        variant,
        question,
        series,
        pageContext,
        chartState,
        block,
        seriesMetadata
    }

    const useBackToBackSeriesView = series.length === 2

    return (
        <ChartWrapper
            className="chart-horizontal-bar chart-cardinalities"
            block={block}
            question={question}
        >
            <>
                {/* <pre>
                    <code>{JSON.stringify(chartState, null, 2)}</code>
                </pre> */}
                <ChartControls right={<ViewSwitcher chartState={chartState} />} />
                {useBackToBackSeriesView ? (
                    <BackToBack serie1={series[0]} serie2={series[1]} {...commonProps} />
                ) : (
                    <GridWrapper seriesCount={series.length}>
                        {series.map((serie, serieIndex) => (
                            <CardinalitiesSerie
                                key={serie.name}
                                serie={serie}
                                serieIndex={serieIndex}
                                {...commonProps}
                            />
                        ))}
                    </GridWrapper>
                )}

                <Note block={block} />

                <ChartFooter
                    // left={
                    //     <Metadata
                    //         average={average}
                    //         median={percentiles?.p50}
                    //         completion={completion}
                    //         {...commonProps}
                    //     />
                    // }
                    right={
                        <>
                            <ChartShare {...commonProps} />
                            <ChartData {...commonProps} />
                        </>
                    }
                />

                {/* <Actions {...commonProps} /> */}
                {/* <pre>
                <code>{JSON.stringify(buckets, null, 2)}</code>
            </pre> */}

                {/* <pre>
                <code>{JSON.stringify(chartValues, null, 2)}</code>
            </pre> */}
            </>
        </ChartWrapper>
    )
}

export default CardinalitiesBlock
