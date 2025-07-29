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
import { RatiosEnum, StandardQuestionData } from '@devographics/types'
import Columns from '../verticalBar2/columns/Columns'
import { Lines } from '../verticalBar2/lines'
import { ColumnWrapper } from '../verticalBar2/columns/ColumnWrapper'
import { useChartValues } from './helpers/chartValues'
import { viewDefinition } from './helpers/viewDefinition'
import { VerticalBarSerieWrapper } from '../verticalBar2/VerticalBarSerieWrapper'
import T from 'core/i18n/T'
import './RatiosByEdition.scss'
import SubsetControls from './SubsetControls'
import { getSubsetIds } from './helpers/subsets'
import {
    BlockHeader,
    BlockHeaderRight_,
    BlockHeaderWrapper,
    Tab_,
    TabsList,
    TabsTrigger
} from 'core/blocks/block/BlockTabsWrapper'
import * as Tabs from '@radix-ui/react-tabs'
import { useI18n } from '@devographics/react-i18n'
import Tooltip from 'core/components/Tooltip'

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

                {enableMultiSection ? (
                    <SubsetModeHeading
                        {...commonProps}
                        legendItems={legendItems}
                        i18nNamespace={i18nNamespace}
                    />
                ) : (
                    <RegularModeHeading
                        {...commonProps}
                        legendItems={legendItems}
                        i18nNamespace={i18nNamespace}
                    />
                )}

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

type HeadingProps = CommonProps<MultiRatiosChartState> & {
    legendItems: LegendItem[]
    i18nNamespace?: string
}

export const RegularModeHeading = (props: HeadingProps) => {
    const { chartState, legendItems, i18nNamespace } = props
    return (
        <>
            <Legend chartState={chartState} items={legendItems} i18nNamespace={i18nNamespace} />
            <ChartControls
                left={<ModeSwitcher chartState={chartState} />}
                right={<ViewSwitcher chartState={chartState} />}
            />
            <RatioDescriptionNote chartState={chartState} />
        </>
    )
}

export const SubsetModeHeading = (props: HeadingProps) => {
    const { chartState, series, question, i18nNamespace, pageContext } = props
    const { view, setView } = chartState
    const { getString } = useI18n()

    const ratios = Object.values(RatiosEnum).filter(r => r !== RatiosEnum.POSITIVITY)

    return (
        <>
            <Tabs.Root
                defaultValue="tab0"
                orientation="horizontal"
                value={view}
                activationMode="manual"
                onValueChange={(value: RatiosEnum) => {
                    setView(value)
                }}
            >
                <BlockHeaderWrapper>
                    <BlockHeader className="block-header">
                        <BlockHeaderRight_>
                            <TabsList aria-label="tabs example">
                                {ratios.map(id => {
                                    const labelKey = `ratios.${id}`
                                    const descriptionKey = `${labelKey}.description`
                                    const label = getString(labelKey)?.t
                                    const Icon = ratioViewsIcons[id]
                                    return (
                                        <Tab_ key={id}>
                                            <TabsTrigger value={id}>
                                                <Tooltip
                                                    showBorder={false}
                                                    trigger={
                                                        <span className="ratios-tabs-tab">
                                                            <Icon size="petite" />{' '}
                                                            <span data-key={id}>{label}</span>
                                                        </span>
                                                    }
                                                    contents={
                                                        <T
                                                            k={descriptionKey}
                                                            html={true}
                                                            md={true}
                                                        />
                                                    }
                                                />
                                            </TabsTrigger>
                                        </Tab_>
                                    )
                                })}
                            </TabsList>
                        </BlockHeaderRight_>
                    </BlockHeader>
                </BlockHeaderWrapper>
            </Tabs.Root>

            {/* <ViewSwitcher chartState={chartState} /> */}
            <RatioDescriptionNote chartState={chartState} />
            <SubsetControls
                series={series}
                question={question}
                chartState={chartState}
                i18nNamespace={i18nNamespace}
                pageContext={pageContext}
            />
        </>
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
    const { serie, question, chartState, block, legendItems, pageContext } = props
    const { subset } = chartState
    const { getLineItems } = viewDefinition
    const lineItems = getLineItems({ serie, question, chartState })
    const { i18nNamespace, variables } = block
    const chartValues = useChartValues({ lineItems, chartState, block, question, legendItems })

    const { columnIds } = chartValues

    const commonProps = {
        ...props,
        chartState,
        chartValues,
        viewDefinition
    }

    const sections = pageContext?.currentEdition.sections
    const subsetIds = getSubsetIds({ subset, lineItems, sections })
    let legendItemsSubset = legendItems
    if (subsetIds.length > 0) {
        // only keep items in subset
        // and also make sure legend is sorted in same order as subset ids
        legendItemsSubset = legendItems
            .filter(item => subsetIds.includes(item.id))
            .toSorted((a, b) => subsetIds.indexOf(a.id) - subsetIds.indexOf(b.id))
    }

    return (
        <div className="chart-multi-ratios-content">
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

            {variables?.enableMultiSection && (
                <Legend
                    chartState={chartState}
                    items={legendItemsSubset}
                    i18nNamespace={i18nNamespace}
                />
            )}
        </div>
    )
}

export default RatiosByEdition
