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
import ViewSwitcher, { ratioViewsIcons } from './ViewSwitcher'
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
import T from 'core/i18n/T'
import './RatiosByEdition.scss'
import SubsetControls, { getTopItems } from './SubsetControls'

export interface RatiosByEditionProps extends BlockComponentProps {
    series: MultiRatioSerie[]
}

export const RatiosByEdition = (props: RatiosByEditionProps) => {
    // const { getString } = useI18n()
    const { block, series, question, pageContext, variant } = props
    const { variables } = block
    const enableMultiSection = variables?.enableMultiSection

    const { i18nNamespace } = block

    const chartState = useChartState(getDefaultState({ block, series, question }))

    const legendItems = uniqBy(series.map(serie => serie.data).flat(), item => item.id)

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
        <ChartWrapper
            block={block}
            question={question}
            className={`chart-vertical-bar chart-multi-ratios ${
                enableMultiSection ? 'chart-multi-ratios-multiSection' : ''
            }`}
        >
            <>
                {/* <pre>
                    <code>{JSON.stringify(chartState, null, 2)}</code>
                </pre> */}

                {!enableMultiSection && (
                    <Legend
                        chartState={chartState}
                        items={legendItems}
                        i18nNamespace={i18nNamespace}
                    />
                )}

                <ChartControls
                    left={!enableMultiSection && <ModeSwitcher chartState={chartState} />}
                    right={<ViewSwitcher chartState={chartState} />}
                />

                <RatioDescriptionNote chartState={chartState} />
                {enableMultiSection && (
                    <SubsetControls
                        series={series}
                        question={question}
                        chartState={chartState}
                        i18nNamespace={i18nNamespace}
                        pageContext={pageContext}
                    />
                )}

                <div className="chart-multi-ratios-content">
                    <GridWrapper seriesCount={series.length}>
                        {series.map((serie, serieIndex) => (
                            <VerticalBarSerieWrapper
                                key={serie.name}
                                serie={serie}
                                serieIndex={serieIndex}
                                {...commonProps}
                            >
                                <RatiosByEditionSerie
                                    {...commonProps}
                                    serie={serie}
                                    legendItems={legendItems}
                                />
                            </VerticalBarSerieWrapper>
                        ))}
                    </GridWrapper>
                    <Legend
                        chartState={chartState}
                        items={legendItems}
                        i18nNamespace={i18nNamespace}
                    />
                </div>

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

export const RatioDescriptionNote = (props: { chartState: MultiRatiosChartState }) => {
    const { chartState } = props

    const Icon = ratioViewsIcons[chartState.view]

    return (
        <div className="ratio-description chart-note">
            <Icon />{' '}
            <h4>
                <T k={`ratios.${chartState.view}`} />:
            </h4>{' '}
            <T k={`ratios.${chartState.view}.description`} md={true} html={true} element="span" />
        </div>
    )
}

export const RatiosByEditionSerie = (
    props: CommonProps<MultiRatiosChartState> & {
        serie: MultiRatioSerie
        legendItems: LegendItem[]
    }
) => {
    const { serie, question, chartState, block, legendItems } = props
    const { subset } = chartState
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
        <>
            <Columns<StandardQuestionData[], EditionWithRankAndPointData, MultiRatiosChartState>
                {...commonProps}
                hasZebra={true}
            >
                <>
                    {columnIds.map((columnId, i) => (
                        <ColumnWrapper<
                            StandardQuestionData[],
                            EditionWithRankAndPointData,
                            MultiRatiosChartState
                        >
                            {...commonProps}
                            columnIndex={i}
                            key={columnId}
                            columnId={columnId}
                        />
                    ))}
                    <Lines<
                        StandardQuestionData[],
                        EditionWithRankAndPointData,
                        MultiRatiosChartState
                    >
                        {...commonProps}
                        lineItems={lineItems}
                    />
                </>
            </Columns>
        </>
    )
}

export default RatiosByEdition
