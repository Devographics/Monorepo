import React from 'react'
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
import { getBlockNoteKey } from 'core/helpers/blockHelpers'
import { useI18n } from '@devographics/react-i18n'
import { VerticalBarSerie } from './VerticalBarSerie'
import { VerticalBarChartState } from './types'

export interface VerticalBarBlock2Props extends BlockComponentProps {
    data: StandardQuestionData
    series: DataSeries<StandardQuestionData>[]
}

/*

Note: always used for historical data

*/
export const VerticalBarBlock2 = (props: VerticalBarBlock2Props) => {
    const { getString } = useI18n()
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

    const key = getBlockNoteKey({ block })
    const note = getString(key, {})?.t

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

                <ChartFooter>
                    <>
                        <Metadata
                            average={average}
                            median={percentiles?.p50}
                            completion={completion}
                            {...commonProps}
                        />
                        <ChartData {...commonProps} />
                    </>
                </ChartFooter>
                {/* <Actions {...commonProps} /> */}

                {note && <Note>{note}</Note>}
            </>
        </ChartWrapper>
    )
}

export default VerticalBarBlock2
