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
import { CommonProps } from '../common2/types'
import ChartData from '../common2/ChartData'
import { VerticalBarSerie } from './VerticalBarSerie'
import { VerticalBarChartState } from './types'
import ChartShare from '../common2/ChartShare'

export interface VerticalBarBlock2Props extends BlockComponentProps {
    data: StandardQuestionData
    series: DataSeries<StandardQuestionData>[]
}

/*

Note: always used for historical data

*/
export const VerticalBarBlock2 = (props: VerticalBarBlock2Props) => {
    const { block, series, question, pageContext, variant } = props
    const allEditions = getAllEditions({ serie: series[0], block })
    const currentEdition = allEditions.at(-1)
    if (currentEdition === undefined) {
        throw new Error(`${block.id}: empty allEditions array`)
    }

    const { average, percentiles, completion } = currentEdition

    const chartState = useChartState(getDefaultState({ block }))

    const commonProps: CommonProps<VerticalBarChartState> = {
        variant,
        question,
        series,
        pageContext,
        chartState,
        block
    }

    return (
        <ChartWrapper className="chart-vertical-bar">
            <>
                {/* <pre>
                    <code>{JSON.stringify(chartState, null, 2)}</code>
                </pre> */}

                <GridWrapper seriesCount={series.length}>
                    {series.map((serie, serieIndex) => (
                        <VerticalBarSerie
                            key={serie.name}
                            serie={serie}
                            serieIndex={serieIndex}
                            {...commonProps}
                        />
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
