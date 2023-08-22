import React, { useState } from 'react'
import BlockVariant from 'core/blocks/block/BlockVariant'
import ChartContainer from 'core/charts/ChartContainer'
import { LineChart } from 'core/charts/toolsRatiosLineChart/LineChart'
import { getTableData } from 'core/helpers/datatables'
import { useTheme } from 'styled-components'
import styled, { css } from 'styled-components'
import DynamicDataLoader from 'core/filters/dataloaders/DynamicDataLoader'
import { useChartFilters } from 'core/filters/helpers'
import { MODE_GRID } from 'core/filters/constants'
import { MetricId } from 'core/helpers/units'
import { ToolRatiosQuestionData, RatiosUnits, Entity } from '@devographics/types'
import { useEntities } from 'core/helpers/entities'
import { BlockDefinition } from 'core/types/block'

export interface MetricBucket {
    year: number
    rank: number
    percentageQuestion: number
}

export interface ToolsExperienceRankingBlockProps {
    block: BlockDefinition
    triggerId: MetricId
    data: ToolRatiosQuestionData
    titleProps: any
}

export const getLabel = (id: string, allEntities: Entity[]) => {
    const entity = allEntities.find(e => e.id === id)
    const label = entity?.nameClean || entity?.name || id
    return label
}

export const ToolsExperienceLineChartBlock = ({
    block,
    data,
    triggerId
}: ToolsExperienceRankingBlockProps) => {
    const { defaultUnits = 'satisfaction', availableUnits } = block
    const [current, setCurrent] = useState()
    const [metric, setMetric] = useState<MetricId>(defaultUnits)
    const theme = useTheme()
    const allEntities = useEntities()

    const controlledMetric = triggerId || metric

    const { years, items } = data
    // const chartData: RankingChartSerie[] = processBlockData(data, { getLabel, controlledMetric })

    const legends = items.map((item, i) => {
        const label = getLabel(item.id, allEntities)
        return { id: item.id, label, shortLabel: label, color: theme.colors.distinct[i] }
    })

    const currentColor = current && legends?.find(l => l.id === current)?.color

    const tableData = items.map(tool => {
        const cellData = { label: getLabel(tool.id, allEntities) }
        Object.values(RatiosUnits).forEach(metric => {
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
                options: availableUnits || Object.values(RatiosUnits),
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
                    valueKeys: Object.values(RatiosUnits).map(m => `${m}_percentage`),
                    years
                })
            ]}
            chartFilters={chartFilters}
            setChartFilters={setChartFilters}
        >
            <DynamicDataLoader
                defaultData={data}
                block={block}
                chartFilters={chartFilters}
                layout="grid"
            >
                <ChartContainer height={items.length * 30 + 80}>
                    <LineChartWrapper current={current} currentColor={currentColor}>
                        <LineChart data={data} units={controlledMetric} />
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

export default ToolsExperienceLineChartBlock
