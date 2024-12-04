import React from 'react'
import { BlockComponentProps } from 'core/types'
import { ChartControls, ChartFooter, ChartWrapper, GridWrapper, Note } from '../common2'
import { CommonProps, LegendItem } from '../common2/types'
import ChartData from '../common2/ChartData'
// import { getBlockNoteKey } from 'core/helpers/blockHelpers'
// import { useI18n } from '@devographics/react-i18n'
import { MultiRatioSerie, MultiRatiosChartState } from './types'
import ChartShare from '../common2/ChartShare'
import { getDefaultState, useChartState } from './helpers/chartState'
import ViewSwitcher from './ViewSwitcher'
import Legend from '../common2/Legend'
import uniqBy from 'lodash/uniqBy'
import ModeSwitcher from './ModeSwitcher'
import { EditionWithRankAndPointData } from './types'
import { StandardQuestionData } from '@devographics/types'
import Columns from '../verticalBar2/columns/Columns'
import { Lines } from '../verticalBar2/lines'
import { ColumnWrapper } from '../verticalBar2/columns/ColumnWrapper'
import { useChartValues } from './helpers/chartValues'
import { viewDefinition } from './helpers/viewDefinition'
import { VerticalBarSerieWrapper } from '../verticalBar2/VerticalBarSerieWrapper'

export interface RatiosByEditionProps extends BlockComponentProps {
    series: MultiRatioSerie[]
}

export const RatiosByEdition = (props: RatiosByEditionProps) => {
    // const { getString } = useI18n()
    const { block, series, question, pageContext, variant } = props

    const legendItems = uniqBy(series.map(serie => serie.data).flat(), item => item.id)

    const chartState = useChartState(getDefaultState({ block }))

    const commonProps: CommonProps<MultiRatiosChartState> = {
        variant,
        question,
        series,
        pageContext,
        chartState,
        block
    }

    // const key = getBlockNoteKey({ block })
    // const note = getString(key, {})?.t

    return (
        <ChartWrapper question={question} className="chart-vertical-bar chart-multi-ratios">
            <>
                {/* <pre>
                    <code>{JSON.stringify(chartState, null, 2)}</code>
                </pre> */}

                <Legend chartState={chartState} items={legendItems} />
                <ChartControls
                    left={<ModeSwitcher chartState={chartState} />}
                    right={<ViewSwitcher chartState={chartState} />}
                />

                <GridWrapper seriesCount={series.length}>
                    {series.map((serie, serieIndex) => (
                        <VerticalBarSerieWrapper
                            key={serie.name}
                            serie={serie}
                            serieIndex={serieIndex}
                            {...commonProps}
                        >
                            <Serie {...commonProps} serie={serie} legendItems={legendItems} />
                        </VerticalBarSerieWrapper>
                    ))}
                </GridWrapper>

                <Note block={block} />

                <ChartFooter
                    right={
                        <>
                            <ChartShare {...commonProps} />
                            <ChartData {...commonProps} />
                        </>
                    }
                />
            </>
        </ChartWrapper>
    )
}

const Serie = (
    props: CommonProps<MultiRatiosChartState> & {
        serie: MultiRatioSerie
        legendItems: LegendItem[]
    }
) => {
    const { serie, question, chartState, block, legendItems } = props
    const { getLineItems } = viewDefinition
    const lineItems = getLineItems({ serie, question, chartState })

    const chartValues = useChartValues({ lineItems, chartState, block, question, legendItems })

    const { columnIds } = chartValues

    const commonProps = {
        ...props,
        chartState,
        chartValues,
        viewDefinition
    }

    return (
        <Columns<StandardQuestionData[], EditionWithRankAndPointData, MultiRatiosChartState>
            {...commonProps}
            hasZebra={true}
        >
            <>
                {columnIds.map((columnId, i) => (
                    <ColumnWrapper {...props} columnIndex={i} key={columnId} columnId={columnId} />
                ))}
                <Lines<StandardQuestionData[], EditionWithRankAndPointData, MultiRatiosChartState>
                    {...commonProps}
                    lineItems={lineItems}
                />
            </>
        </Columns>
    )
}

export default RatiosByEdition
