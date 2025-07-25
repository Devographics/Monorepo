import React from 'react'
import '../common2/ChartsCommon.scss'
import './VerticalBar.scss'
import Metadata from '../common2/Metadata'
import { BlockComponentProps } from 'core/types'
import { StandardQuestionData } from '@devographics/types'
import { DataSeries } from 'core/filters/types'
import { getDefaultState, useChartState } from './helpers/chartState'
import { getAllEditions } from './helpers/other'
import { ChartFooter, ChartWrapper, GridWrapper, Note } from '../common2'
import ChartData from '../common2/ChartData'
import { VerticalBarChartState } from './types'
import ChartShare from '../common2/ChartShare'
import { getViewDefinition } from './helpers/views'
import { VerticalBarSerieWrapper } from './VerticalBarSerieWrapper'
import { NoData } from '../common2/NoData'

export interface VerticalBarBlock2Props extends BlockComponentProps {
    data: StandardQuestionData
    series: DataSeries<StandardQuestionData>[]
}

export const VerticalBarBlock2 = (props: VerticalBarBlock2Props) => {
    const { block, series, question, pageContext, variant } = props
    const allEditions = getAllEditions({ serie: series[0], block })
    const currentEdition = allEditions?.at(-1)

    if (!currentEdition) {
        console.log(allEditions)
        console.log(props)
        return <NoData<VerticalBarBlock2Props> {...props} />
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
                        <VerticalBarSerieWrapper<StandardQuestionData, VerticalBarChartState>
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

export default VerticalBarBlock2
