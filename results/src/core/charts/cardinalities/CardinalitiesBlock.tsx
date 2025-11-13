import React from 'react'
import { StandardQuestionData } from '@devographics/types'
import { ChartControls, ChartFooter, ChartWrapper, GridWrapper, Metadata, Note } from '../common2'
import { CommonProps } from '../common2/types'
import ChartData from '../common2/ChartData'
import ChartShare from '../common2/ChartShare'
import { BackToBack } from '../common2/BackToBack'
import { DataSeries } from 'core/filters/types'
import { CardinalitiesSerie } from './CardinalitiesSerie'
import { BlockComponentProps } from 'core/types'
import { useChartState } from './helpers/chartState'
import { CardinalitiesChartState } from './types'
import { getSerieBuckets, getSeriesMetadata } from './helpers/other'
import { getViewDefinition } from './helpers/views'
import ViewSwitcher from './ViewSwitcher'
import './Cardinalities.scss'
import sum from 'lodash/sum'
import round from 'lodash/round'

type CardinalitiesBlockProps = BlockComponentProps & {
    series: DataSeries<StandardQuestionData[]>[]
}

export const CardinalitiesBlock = (props: CardinalitiesBlockProps) => {
    const { block, series, pageContext, variant } = props

    const chartState = useChartState()

    const viewDefinition = getViewDefinition(chartState.view)
    const { getValue } = viewDefinition

    const seriesMetadata = getSeriesMetadata({
        series,
        block,
        chartState,
        viewDefinition
    })

    const commonProps: CommonProps<CardinalitiesChartState> = {
        variant,
        series,
        pageContext,
        chartState,
        block,
        seriesMetadata,
        viewDefinition
    }

    const firstSeriebuckets = getSerieBuckets({ serie: series[0], chartState })
    const firstSerieAverage = round(
        sum(firstSeriebuckets.map(b => Number(b.id) * (b?.count ?? 0))) /
            sum(firstSeriebuckets.map(b => b?.count ?? 0)),
        1
    )

    const useBackToBackSeriesView = series.length === 2

    return (
        <ChartWrapper className="chart-horizontal-bar chart-cardinalities" block={block}>
            <>
                {/* <pre>
                    <code>{JSON.stringify(chartState, null, 2)}</code>
                </pre> */}
                {/* <ChartControls right={<ViewSwitcher chartState={chartState} />} /> */}
                {useBackToBackSeriesView ? (
                    <BackToBack
                        component={CardinalitiesSerie}
                        serie1={series[0]}
                        serie2={series[1]}
                        {...commonProps}
                    />
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
                    left={
                        <Metadata
                            average={firstSerieAverage}
                            series={series}
                            // median={percentiles?.p50}
                            // completion={completion}
                        />
                    }
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
