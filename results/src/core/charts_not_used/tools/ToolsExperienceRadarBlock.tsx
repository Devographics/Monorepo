import React, { useState, useMemo } from 'react'
import { BlockContext } from 'core/blocks/types'
// @ts-ignore
import Block from 'core/blocks/block/BlockVariant'
// @ts-ignore
import ChartContainer from 'core/charts/ChartContainer'
import { RadarChart, RadarChartSerie } from 'core/charts_not_used/generic/RadarChart'
// @ts-ignore
import ButtonGroup from 'core/components/ButtonGroup'
// @ts-ignore
import Button from 'core/components/Button'
import { Entity } from '@types/index'
// @ts-ignore
import T from 'core/i18n/T'
// @ts-ignore
import { useI18n } from 'core/i18n/i18nContext'
import { getTableData } from 'core/helpers/datatables'

type MetricId = 'satisfaction' | 'interest' | 'usage' | 'awareness'
type ViewId = 'viz' | 'data'

const ALL_METRICS: MetricId[] = ['satisfaction', 'interest', 'usage', 'awareness']

interface MetricBucket {
    year: number
    rank: number
    percentageQuestion: number
}

interface ToolData extends Record<MetricId, MetricBucket[]> {
    id: string
    entity: Entity
}

interface ToolsExperienceRankingBlockData {
    years: number[]
    experience: ToolData[]
}

interface ToolsExperienceRankingBlockProps {
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

const getChartData = ({ data }: { data: ToolData[] }) => {
    return useMemo(() => {
        const chartData = ALL_METRICS.map(id => ({ id }))
        // const metricsData = Object.fromEntries(ALL_METRICS.map(metric => [metric, {}]));
        data.forEach(tool => {
            ALL_METRICS.forEach(metric => {
                const metricItem = chartData.find(item => item.id === metric)
                metricItem[tool.id] = tool[metric][0].percentageQuestion
            })
        })
        return chartData
    }, [data])
}

export const ToolsExperienceRadarBlock = ({
    block,
    data,
    triggerId
}: ToolsExperienceRankingBlockProps) => {
    const [metric, setMetric] = useState<MetricId>('satisfaction')
    const { getString } = useI18n()

    const { ids, years, experience } = data
    const chartData: RadarChartSerie[] = getChartData({ data: experience })

    // const tableData = experience.map(tool => {
    //     const cellData = { label: tool?.entity?.name }
    //     ALL_METRICS.forEach(metric => {
    //         cellData[`${metric}_percentage`] = tool[metric]?.map(y => ({
    //             year: y.year,
    //             value: y.percentageQuestion
    //         }))
    //         cellData[`${metric}_rank`] = tool[metric]?.map(y => ({
    //             year: y.year,
    //             value: y.rank
    //         }))
    //     })
    //     return cellData
    // })

    return (
        <Block
            block={block}
            data={data}
            // tables={[
            //     getTableData({
            //         title: getString('table.rankings_table').t,
            //         data: tableData,
            //         valueKeys: ALL_METRICS.map(m => `${m}_rank`),
            //         years
            //     }),
            //     getTableData({
            //         title: getString('table.percentages_table').t,
            //         data: tableData,
            //         valueKeys: ALL_METRICS.map(m => `${m}_percentage`),
            //         years
            //     })
            // ]}
        >
            <ChartContainer height={experience.length * 50 + 80} minWidth={800}>
                <RadarChart data={chartData} keys={ids} />
            </ChartContainer>
        </Block>
    )
}
