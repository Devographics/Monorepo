import React, { useState, useMemo } from 'react'
import { BlockContext } from 'core/blocks/types'
// @ts-ignore
import BlockVariant from 'core/blocks/block/BlockVariant'
// @ts-ignore
import ChartContainer from 'core/charts/ChartContainer'
import { LineChart } from 'core/charts/generic/LineChart'
// @ts-ignore
import ButtonGroup from 'core/components/ButtonGroup'
// @ts-ignore
import Button from 'core/components/Button'
import { Entity } from 'core/types'
// @ts-ignore
import T from 'core/i18n/T'
// @ts-ignore
import { useI18n } from 'core/i18n/i18nContext'
import { getTableData } from 'core/helpers/datatables'
import { useLegends } from 'core/helpers/useBucketKeys'
import { useTheme } from 'styled-components'
import styled, { css } from 'styled-components'
import DynamicDataLoader from 'core/blocks/filters/DynamicDataLoader'
import { useFilterLegends, getInitFilters } from 'core/blocks/filters/helpers'
import { BEHAVIOR_COMBINED, MODE_FACET } from 'core/blocks/filters/constants'
import { defaultOptions } from 'core/blocks/block/BlockUnitsSelector'
import { useAllChartsOptions } from 'core/charts/hooks'

import { MetricId, ALL_METRICS } from 'core/helpers/units'

export interface MetricBucket {
    year: number
    rank: number
    percentage_question: number
}

export interface ToolData extends Record<MetricId, MetricBucket[]> {
    id: string
    entity: Entity
    usage: MetricBucket[]
    awareness: MetricBucket[]
    interest: MetricBucket[]
    satisfaction: MetricBucket[]
}

export interface ToolsExperienceRankingBlockData {
    years: number[]
    experience: ToolData[]
}

export interface ToolsExperienceRankingBlockProps {
    block: BlockContext<
        'toolsExperienceRankingTemplate',
        'ToolsExperienceRankingBlock',
        { toolIds: string },
        any
    >
    triggerId: MetricId
    data: ToolsExperienceRankingBlockData
    titleProps: any
}

const processBlockData = (data: ToolData[], { controlledMetric }: { controlledMetric: any }) => {
    return useMemo(
        () =>
            data.map(tool => {
                return {
                    id: tool.id,
                    name: tool?.entity?.name,
                    data: tool[controlledMetric]?.map(bucket => {
                        return {
                            x: bucket.year,
                            y: bucket.percentage_question,
                            percentage_question: bucket.percentage_question
                        }
                    })
                }
            }),
        [data, controlledMetric]
    )
}

export const ToolsExperienceLineChartBlock = ({
    block,
    data,
    triggerId
}: ToolsExperienceRankingBlockProps) => {
    const [current, setCurrent] = useState()
    const [metric, setMetric] = useState<MetricId>('satisfaction')
    const theme = useTheme()

    const controlledMetric = triggerId || metric

    const { years, experience } = data
    const chartData: RankingChartSerie[] = processBlockData(experience, { controlledMetric })

    const legends = data.ids.map((id, i) => {
        const label = experience?.find(e => e.id === id)?.entity?.name
        return { id, label, shortLabel: label, color: theme.colors.distinct[i] }
    })

    const currentColor = current && legends?.find(l => l.id === current)?.color

    const tableData = experience.map(tool => {
        const cellData = { label: tool?.entity?.name }
        ALL_METRICS.forEach(metric => {
            cellData[`${metric}_percentage`] = tool[metric]?.map(y => ({
                year: y.year,
                value: y.percentage_question
            }))
            cellData[`${metric}_rank`] = tool[metric]?.map(y => ({
                year: y.year,
                value: y.rank
            }))
        })
        return cellData
    })

    // contains the filters that define the series
    const [chartFilters, setChartFilters] = useState(
        getInitFilters({ behavior: BEHAVIOR_COMBINED })
    )

    // const legends = useFilterLegends({
    //     chartFilters,
    //     currentYear,
    //     showDefaultSeries: chartFilters.options.showDefaultSeries
    // })

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
                defaultBuckets={chartData}
                block={block}
                chartFilters={chartFilters}
                processBlockData={processBlockData}
                processBlockDataOptions={{ controlledMetric }}
            >
                <ChartContainer height={experience.length * 30 + 80} minWidth={800}>
                    <LineChartWrapper current={current} currentColor={currentColor}>
                        <LineChart buckets={chartData} />
                    </LineChartWrapper>
                </ChartContainer>
            </DynamicDataLoader>
        </BlockVariant>
    )
}

const LineChartWrapper = styled.div`
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
