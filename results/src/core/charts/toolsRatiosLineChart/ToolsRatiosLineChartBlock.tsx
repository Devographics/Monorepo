import React, { useState } from 'react'
import BlockVariant from 'core/blocks/block/BlockVariant'
import ChartContainer from 'core/charts/ChartContainer'
import { LineChart, getChartData } from 'core/charts/toolsRatiosLineChart/LineChart'
import { getTableData } from 'core/helpers/datatables'
import { useTheme } from 'styled-components'
import styled, { css } from 'styled-components'
import DynamicDataLoader from 'core/filters/dataloaders/DynamicDataLoader'
import { useChartFilters } from 'core/filters/helpers'
import { MODE_GRID } from 'core/filters/constants'
import { MetricId } from 'core/helpers/units'
import { ToolRatiosQuestionData, RatiosUnits, Entity } from '@devographics/types'
import { useEntities } from 'core/helpers/entities'
import { BlockComponentProps, BlockVariantDefinition } from 'core/types/block'
import { getItemLabel } from 'core/helpers/labels'
import { useI18n } from '@devographics/react-i18n'
import { DataSeries } from 'core/filters/types'

export interface MetricBucket {
    year: number
    rank: number
    percentageQuestion: number
}

export interface ToolsExperienceRankingBlockProps extends BlockComponentProps {
    data: ToolRatiosQuestionData
    series: DataSeries<ToolRatiosQuestionData>[]
}

export const ToolsExperienceLineChartBlock = ({
    block,
    data,
    series
}: ToolsExperienceRankingBlockProps) => {
    const {
        defaultUnits = 'satisfaction',
        availableUnits: availableUnits_,
        i18nNamespace = 'tools',
        filtersState
    } = block
    const [current, setCurrent] = useState()
    const [metric, setMetric] = useState<MetricId>(defaultUnits)
    const theme = useTheme()
    const allEntities = useEntities()
    const { getString } = useI18n()

    const availableUnits = availableUnits_ || Object.values(RatiosUnits)
    const controlledMetric = metric

    const { years: yearsDoesNotWork, items } = data
    // Note: we can't actually get years from data.years because it wouldn't reflect
    // when we only select a subset of years
    const years = items[0][availableUnits[0]].map(dataPoint => dataPoint.year)

    // const chartData: RankingChartSerie[] = processBlockData(data, { getLabel, controlledMetric })

    const options = { units: metric, allEntities, getString, i18nNamespace }
    const chartData = series
        ? getChartData(series[0].data, block, options)
        : getChartData(data, block, options)

    const legends = items.map((item, i) => {
        const { id } = item
        const entity = allEntities.find(e => e.id === id)

        const { label } = getItemLabel({ id, entity, i18nNamespace, getString })
        return { id: item.id, label, shortLabel: label, color: theme.colors.distinct[i] }
    })

    const currentColor = current && legends?.find(l => l.id === current)?.color

    const tableData = items.map(item => {
        const { id } = item
        const entity = allEntities.find(e => e.id === id)
        const { label } = getItemLabel({ id, entity, i18nNamespace, getString })
        const cellData = { label }
        availableUnits.forEach(metric => {
            cellData[`${metric}_percentage`] = item[metric]?.map(y => ({
                year: y.year,
                value: y.percentageQuestion
            }))
            cellData[`${metric}_rank`] = item[metric]?.map(y => ({
                year: y.year,
                value: y.rank
            }))
        })
        return cellData
    })

    const { chartFilters, setChartFilters } = useChartFilters({
        block,
        options: { supportedModes: [MODE_GRID], enableYearSelect: false },
        buckets: chartData,
        providedFiltersState: filtersState
    })

    const defaultSeries = { name: 'default', data }

    return (
        <BlockVariant
            block={block}
            // titleProps={{ switcher: <Switcher setMetric={setMetric} metric={controlledMetric} /> }}
            data={data}
            modeProps={{
                units: controlledMetric,
                options: availableUnits,
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
                    valueKeys: availableUnits.map(m => `${m}_percentage`),
                    years
                })
            ]}
            chartFilters={chartFilters}
            setChartFilters={setChartFilters}
        >
            <DynamicDataLoader
                defaultSeries={defaultSeries}
                block={block}
                chartFilters={chartFilters}
                setChartFilters={setChartFilters}
                layout="grid"
                getChartData={getChartData}
                getChartDataOptions={{
                    allEntities,
                    units: controlledMetric,
                    i18nNamespace,
                    getString
                }}
            >
                <ChartContainer height={items.length * 30 + 80}>
                    <LineChartWrapper current={current} currentColor={currentColor}>
                        <LineChart
                            block={block}
                            data={data}
                            units={controlledMetric}
                            i18nNamespace={i18nNamespace}
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

export default ToolsExperienceLineChartBlock
