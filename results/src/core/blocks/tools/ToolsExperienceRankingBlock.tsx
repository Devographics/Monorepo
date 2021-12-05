import React, { useState, useMemo } from 'react'
import { BlockContext } from 'core/blocks/types'
// @ts-ignore
import Block from 'core/blocks/block/BlockVariant'
// @ts-ignore
import ChartContainer from 'core/charts/ChartContainer'
import { RankingChart, RankingChartSerie } from 'core/charts/generic/RankingChart'
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

type MetricId = 'satisfaction' | 'interest' | 'usage' | 'awareness'
type ViewId = 'viz' | 'data'

const ALL_METRICS: MetricId[] = ['satisfaction', 'interest', 'usage', 'awareness']

interface SwitcherProps {
    setMetric: (metric: MetricId) => void
    metric: MetricId
}

const Switcher = ({ setMetric, metric }: SwitcherProps) => {
    return (
        <ButtonGroup>
            {ALL_METRICS.map(key => (
                <Button
                    key={key}
                    size="small"
                    className={`Button--${metric === key ? 'selected' : 'unselected'}`}
                    onClick={() => setMetric(key)}
                >
                    <T k={`options.experience_ranking.${key}`} />
                </Button>
            ))}
        </ButtonGroup>
    )
}

interface MetricBucket {
    year: number
    rank: number
    percentage_question: number
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

const getChartData = ({ data, controlledMetric }: { data: ToolData[]; controlledMetric: any }) => {
    return useMemo(
        () =>
            data.map(tool => {
                return {
                    id: tool.id,
                    name: tool.entity.name,
                    data: tool[controlledMetric].map(bucket => {
                        return {
                            x: bucket.year,
                            y: bucket.rank,
                            percentage_question: bucket.percentage_question
                        }
                    })
                }
            }),
        [data, controlledMetric]
    )
}

export const ToolsExperienceRankingBlock = ({
    block,
    data,
    triggerId
}: ToolsExperienceRankingBlockProps) => {
    const [metric, setMetric] = useState<MetricId>('satisfaction')
    const { getString } = useI18n()

    const controlledMetric = triggerId || metric

    const { years, experience } = data
    const chartData: RankingChartSerie[] = getChartData({ data: experience, controlledMetric })

    const tableData = experience.map(tool => {
        const cellData = { label: tool.entity.name }
        ALL_METRICS.forEach(metric => {
            cellData[`${metric}_percentage`] = tool[metric].map(y => ({
                year: y.year,
                value: y.percentage_question
            }))
            cellData[`${metric}_rank`] = tool[metric].map(y => ({
                year: y.year,
                value: y.rank
            }))
        })
        return cellData
    })

    return (
        <Block
            block={block}
            // titleProps={{ switcher: <Switcher setMetric={setMetric} metric={controlledMetric} /> }}
            data={data}
            modeProps={{
                units: controlledMetric,
                options: ALL_METRICS,
                onChange: setMetric,
                i18nNamespace: 'options.experience_ranking'
            }}
            tables={[
                getTableData({
                    title: getString('table.rankings_table').t,
                    data: tableData,
                    valueKeys: ALL_METRICS.map(m => `${m}_rank`),
                    years
                }),
                getTableData({
                    title: getString('table.percentages_table').t,
                    data: tableData,
                    valueKeys: ALL_METRICS.map(m => `${m}_percentage`),
                    years
                })
            ]}
        >
            <ChartContainer height={experience.length * 50 + 80}>
                <RankingChart data={chartData} />
            </ChartContainer>
        </Block>
    )
}
