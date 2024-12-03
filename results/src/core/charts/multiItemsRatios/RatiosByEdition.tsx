import React from 'react'
import '../common2/ChartsCommon.scss'
import { BlockComponentProps } from 'core/types'
// import { getDefaultState, useChartState } from './helpers/chartState'
// import { getAllEditions } from './helpers/other'
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
import { VerticalBarSerie } from '../verticalBar2/VerticalBarSerie'
import { VerticalBarViewDefinition } from 'core/charts/verticalBar2/types'
import { EditionWithRank, ModesEnum } from './types'
import { StandardQuestionData } from '@devographics/types'
import { getEditionByYear } from '../verticalBar2/helpers/other'
import sortBy from 'lodash/sortBy'
import { formatPercentage } from 'core/charts/common2/helpers/format'
import min from 'lodash/min'
import Columns from '../verticalBar2/columns/Columns'
import { Lines } from '../verticalBar2/lines'
import { ColumnWrapper } from '../verticalBar2/columns/ColumnWrapper'
import { useChartValues } from './helpers/chartValues'

export const getAllEditions = (item: StandardQuestionData) => item?.responses?.allEditions || []

export const viewDefinition: VerticalBarViewDefinition<
    StandardQuestionData[],
    EditionWithRank,
    MultiRatiosChartState
> = {
    getLineItems: ({ serie, chartState }) => {
        const { view } = chartState
        const items = serie.data
        const allYears = items
            .map(item => item.responses.allEditions)
            .flat()
            .map(e => e.year)
        const startYear = min(allYears) ?? 0
        const itemsWithRank = items.map(item => ({
            ...item,
            points: getAllEditions(item).map(edition => {
                // find ratios for all items for current year/edition
                let allItemsRatios = items.map(item => {
                    // for each item, get the edition of the same year as the one we're currently looking at
                    const sameYearEdition = getEditionByYear(edition.year, getAllEditions(item))
                    const ratio = sameYearEdition?.ratios?.[view]
                    return { id: item.id, ratio }
                })
                // discard any undefined ratios
                allItemsRatios = allItemsRatios.filter(r => r.ratio !== undefined)
                // sort by ratio, descending
                allItemsRatios = sortBy(allItemsRatios, r => r.ratio).toReversed()
                // find current item's rank among all items (for same edition)
                const rank = allItemsRatios.findIndex(r => r.id === item.id) + 1
                return {
                    ...edition,
                    id: edition.editionId,
                    rank,
                    value: edition?.ratios?.[view],
                    columnId: edition.editionId,
                    columnIndex: edition.year - startYear
                }
            })
        }))
        return itemsWithRank
    },
    formatValue: (value, _question, chartState) =>
        chartState.mode === ModesEnum.VALUE ? formatPercentage(value) : `#${value + 1}`,
    getPointValue: (point, chartState) =>
        chartState.mode === ModesEnum.VALUE
            ? Math.floor((point?.ratios?.[chartState.view] || 0) * 100)
            : point.rank - 1
}

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
                        <VerticalBarSerie
                            key={serie.name}
                            serie={serie}
                            serieIndex={serieIndex}
                            {...commonProps}
                        >
                            <ChartContents
                                {...commonProps}
                                serie={serie}
                                legendItems={legendItems}
                            />
                        </VerticalBarSerie>
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

const ChartContents = (
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
        <Columns<StandardQuestionData[], EditionWithRank, MultiRatiosChartState>
            {...commonProps}
            hasZebra={true}
        >
            <>
                {/* {props.editions.map((edition, i) => (
                <ColumnSingle
                    columnIndex={i}
                    {...props}
                    key={edition.editionId}
                    edition={edition}
                    showCount={false}
                    showBar={false}
                />
            ))} */}
                {columnIds.map((columnId, i) => (
                    <ColumnWrapper {...props} columnIndex={i} key={columnId} columnId={columnId} />
                ))}
                <Lines<StandardQuestionData[], EditionWithRank, MultiRatiosChartState>
                    {...commonProps}
                    lineItems={lineItems}
                />
            </>
        </Columns>
    )
}
