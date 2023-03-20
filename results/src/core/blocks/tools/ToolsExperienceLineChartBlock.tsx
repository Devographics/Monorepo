import React, { useState, useMemo } from 'react'
import { BlockContext } from 'core/blocks/types'
import BlockVariant from 'core/blocks/block/BlockVariant'
import ChartContainer from 'core/charts/ChartContainer'
import { LineChart } from 'core/charts/generic/LineChart'
import ButtonGroup from 'core/components/ButtonGroup'
import Button from 'core/components/Button'
import { Entity } from '@types/index'
import T from 'core/i18n/T'
import { useI18n } from 'core/i18n/i18nContext'
import { getTableData } from 'core/helpers/datatables'
import { useLegends } from 'core/helpers/useBucketKeys'
import { useTheme } from 'styled-components'
import styled, { css } from 'styled-components'
import DynamicDataLoader from 'core/blocks/filters/DynamicDataLoader'
import { useChartFilters } from 'core/blocks/filters/helpers'
import { MODE_GRID } from 'core/blocks/filters/constants'
import { RankingChartSerie } from 'core/charts/generic/RankingChart'
import { MetricId, ALL_METRICS } from 'core/helpers/units'
import { ToolRatiosQuestionData } from '@devographics/types'
import { useEntities } from 'core/helpers/entities'

export interface MetricBucket {
    year: number
    rank: number
    percentageQuestion: number
}

export interface ToolsExperienceRankingBlockProps {
    block: BlockContext<
        'toolsExperienceRankingTemplate',
        'ToolsExperienceRankingBlock',
        { toolIds: string },
        any
    >
    triggerId: MetricId
    data: ToolRatiosQuestionData
    titleProps: any
}

const processBlockData = (
    data: ToolRatiosQuestionData,
    options: { getLabel: any; controlledMetric: any }
) => {
    const { controlledMetric, getLabel } = options
    const buckets = data.items.map(tool => {
        return {
            id: tool.id,
            name: getLabel(tool.id),
            data: tool[controlledMetric]?.map((bucket, index) => {
                const datapoint = {
                    x: bucket.year,
                    y: bucket.percentageQuestion,
                    percentageQuestion: bucket.percentageQuestion
                }
                // add all metrics to datapoint for ease of debugging
                ALL_METRICS.forEach(metric => {
                    datapoint[`${metric}_percentage`] = tool[metric][index].percentageQuestion
                })
                return datapoint
            })
        }
    })
    return buckets
}

export const ToolsExperienceLineChartBlock = ({
    block,
    data,
    triggerId
}: ToolsExperienceRankingBlockProps) => {
    const [current, setCurrent] = useState()
    const [metric, setMetric] = useState<MetricId>('satisfaction')
    const theme = useTheme()
    const allEntities = useEntities()
    const controlledMetric = triggerId || metric

    const getLabel = (id: string) => {
        const entity = allEntities.find(e => e.id === id)
        const label = entity?.nameClean || entity?.name || id
        return label
    }

    const { years, items } = data
    // const chartData: RankingChartSerie[] = processBlockData(data, { getLabel, controlledMetric })

    const legends = items.map((item, i) => {
        const label = getLabel(item.id)
        return { id: item.id, label, shortLabel: label, color: theme.colors.distinct[i] }
    })

    const currentColor = current && legends?.find(l => l.id === current)?.color

    const tableData = items.map(tool => {
        const cellData = { label: getLabel(tool.id) }
        ALL_METRICS.forEach(metric => {
            cellData[`${metric}_percentage`] = tool[metric]?.map(y => ({
                year: y.year,
                value: y.percentageQuestion
            }))
            cellData[`${metric}_rank`] = tool[metric]?.map(y => ({
                year: y.year,
                value: y.rank
            }))
        })
        return cellData
    })

    const { chartFilters, setChartFilters } = useChartFilters({
        block,
        options: { supportedModes: [MODE_GRID], enableYearSelect: false }
    })

    return (
        <BlockVariant
            block={block}
            // titleProps={{ switcher: <Switcher setMetric={setMetric} metric={controlledMetric} /> }}
            data={data}
            modeProps={{
                units: controlledMetric,
                options: ALL_METRICS,
                onChange: setMetric,
                i18nNamespace: 'options.experience_ranking'
            }}
            legendProps={{
                onClick: ({ id }) => {
                    setCurrent(id)
                },
                onMouseEnter: ({ id }) => {
                    setCurrent(id)
                },
                onMouseLeave: () => {
                    setCurrent(null)
                }
            }}
            legends={legends}
            tables={[
                getTableData({
                    data: tableData,
                    valueKeys: ALL_METRICS.map(m => `${m}_percentage`),
                    years
                })
            ]}
            chartFilters={chartFilters}
            setChartFilters={setChartFilters}
        >
            <DynamicDataLoader
                defaultBuckets={data}
                block={block}
                chartFilters={chartFilters}
                layout="grid"
            >
                <ChartContainer height={items.length * 30 + 80}>
                    <LineChartWrapper current={current} currentColor={currentColor}>
                        <LineChart
                            buckets={data}
                            processBlockData={processBlockData}
                            processBlockDataOptions={{ getLabel, controlledMetric }}
                        />
                    </LineChartWrapper>
                </ChartContainer>
            </DynamicDataLoader>
        </BlockVariant>
    )
}

const LineChartWrapper = ({ current, currentColor, children, ...otherProps }) => (
    <LineChartWrapper_ current={current} currentColor={currentColor}>
        {React.cloneElement(children, otherProps)}
    </LineChartWrapper_>
)

const LineChartWrapper_ = styled.div`
    width: 100%;
    height: 100%;
    ${({ theme, current, currentColor }) =>
        current &&
        css`
            path:not([stroke='${currentColor}']),
            circle:not([stroke='${currentColor}']) {
                opacity: 0.3;
                /* stroke: ${theme.colors.text}; */
            }

            path[stroke='${currentColor}'],
            circle[stroke='${currentColor}'] {
                opacity: 1;
                stroke-width: 5;
            }
        `}
`
