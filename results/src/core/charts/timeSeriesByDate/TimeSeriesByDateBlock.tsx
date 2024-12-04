import React from 'react'
import Metadata from '../common2/Metadata'
import { BlockComponentProps } from 'core/types'
import { StandardQuestionData } from '@devographics/types'
import { DataSeries } from 'core/filters/types'
import { getDefaultState, useChartState } from './helpers/chartState'
import { ChartFooter, ChartWrapper, GridWrapper, Note } from '../common2'
import ChartData from '../common2/ChartData'
import ChartShare from '../common2/ChartShare'
import { getViewDefinition } from './helpers/views'
import { VerticalBarSerieWrapper } from '../verticalBar2/VerticalBarSerieWrapper'
import { getChartCurrentEdition } from '../horizontalBar2/helpers/other'
import { TimeSeriesByDateChartState } from './types'

export interface VerticalBarBlock2Props extends BlockComponentProps {
    data: StandardQuestionData
    series: DataSeries<StandardQuestionData>[]
}

export const TimeSeriesByDateBlock = (props: VerticalBarBlock2Props) => {
    const { block, series, question, pageContext, variant } = props
    const currentEdition = getChartCurrentEdition({ serie: series[0], block })

    if (currentEdition === undefined) {
        throw new Error(`${block.id}: empty allEditions array`)
    }

    const { average, percentiles, completion } = currentEdition

    const chartState = useChartState(getDefaultState({ block }))
    const { view } = chartState
    const viewDefinition = getViewDefinition(view)
    const ViewComponent = viewDefinition.component

    const commonProps = {
        variant,
        question,
        series,
        pageContext,
        chartState,
        viewDefinition,
        block
    }

    return (
        <ChartWrapper question={question} className="chart-vertical-bar">
            <>
                {/* <pre>
                    <code>{JSON.stringify(chartState, null, 2)}</code>
                </pre> */}

                <GridWrapper seriesCount={series.length}>
                    {series.map((serie, serieIndex) => (
                        <VerticalBarSerieWrapper<StandardQuestionData, TimeSeriesByDateChartState>
                            key={serie.name}
                            serie={serie}
                            serieIndex={serieIndex}
                            {...commonProps}
                        >
                            <ViewComponent serie={serie} serieIndex={serieIndex} {...commonProps} />
                        </VerticalBarSerieWrapper>
                    ))}
                </GridWrapper>

                <Note block={block} />

                <ChartFooter
                    left={
                        <Metadata
                            average={average}
                            median={percentiles?.p50}
                            completion={completion}
                            {...commonProps}
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
            </>
        </ChartWrapper>
    )
}

export default TimeSeriesByDateBlock
