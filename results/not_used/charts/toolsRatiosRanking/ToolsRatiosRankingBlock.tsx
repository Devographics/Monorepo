import React, { useState, useMemo } from 'react'
import { BlockContext } from 'core/blocks/types'
import Block from 'core/blocks/block/BlockVariant'
import ChartContainer from 'core/charts/ChartContainer'
import { RankingChart, RankingChartSerie } from 'core/charts/toolsRatiosRanking/RankingChart'
import ButtonGroup from 'core/components/ButtonGroup'
import Button from 'core/components/Button'
import T from 'core/i18n/T'
import { useI18n } from '@devographics/react-i18n'
import { getTableData } from 'core/helpers/datatables'
import { MODE_GRID } from 'core/filters/constants'
import { MetricId } from 'core/helpers/units'
import DynamicDataLoader from 'core/filters/dataloaders/DynamicDataLoader'
import { useChartFilters } from 'core/filters/helpers'
import { ToolRatiosQuestionData, Entity, RatiosUnits } from '@devographics/types'
import { useEntities, getEntityName } from 'core/helpers/entities'
import { BlockVariantDefinition, StringTranslator } from 'core/types'
import { getItemLabel } from 'core/helpers/labels'

export interface MetricBucket {
    year: number
    rank: number
    percentageQuestion: number
}

export interface ToolData extends Record<MetricId, MetricBucket[]> {
    id: string
    entity: Entity
    usage: MetricBucket[]
    awareness: MetricBucket[]
    interest: MetricBucket[]
    satisfaction: MetricBucket[]
}

export interface ToolsExperienceRankingBlockProps {
    block: BlockVariantDefinition
    triggerId: MetricId
    data: ToolRatiosQuestionData
    titleProps: any
}

const processBlockData = (
    data: ToolRatiosQuestionData,
    options: {
        controlledMetric: any
        entities: Entity[]
        getString: StringTranslator
        i18nNamespace: string
    }
) => {
    const { controlledMetric, entities, getString, i18nNamespace } = options
    return data?.items?.map(item => {
        const entity = entities.find(e => e.id === item.id)
        const { label } = getItemLabel({ id: item.id, entity, getString, i18nNamespace })

        return {
            id: item.id,
            name: label,
            data: item[controlledMetric]
                ?.filter(bucket => bucket.rank && bucket.percentageQuestion)
                .map(bucket => {
                    return {
                        x: bucket.year,
                        y: bucket.rank,
                        percentageQuestion: bucket.percentageQuestion
                    }
                })
        }
    })
}

export const ToolsExperienceRankingBlock = ({
    block,
    data,
    triggerId
}: ToolsExperienceRankingBlockProps) => {
    const {
        defaultUnits = 'satisfaction',
        availableUnits: availableUnits_,
        i18nNamespace = 'tools'
    } = block

    const [metric, setMetric] = useState<MetricId>(defaultUnits)
    const { getString } = useI18n()
    const allEntities = useEntities()
    const controlledMetric = triggerId || metric

    const availableUnits = availableUnits_ || Object.values(RatiosUnits)

    const { years: yearsDoesNotWork, items } = data
    // Note: we can't actually get years from data.years because it wouldn't reflect
    // when we only select a subset of years
    const years = items[0][availableUnits[0]].map(dataPoint => dataPoint.year)

    const processBlockDataOptions = {
        controlledMetric,
        entities: allEntities,
        getString,
        i18nNamespace
    }
    const chartData: RankingChartSerie[] = processBlockData(data, processBlockDataOptions)

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
        options: { supportedModes: [MODE_GRID], enableYearSelect: false }
    })

    return (
        <Block
            block={block}
            // titleProps={{ switcher: <Switcher setMetric={setMetric} metric={controlledMetric} /> }}
            data={data}
            modeProps={{
                units: controlledMetric,
                options: availableUnits,
                onChange: setMetric,
                i18nNamespace: 'options.experience_ranking'
            }}
            tables={[
                getTableData({
                    data: tableData,
                    valueKeys: availableUnits.map(m => `${m}_rank`),
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
                <ChartContainer height={items.length * 50 + 80}>
                    <RankingChart
                        buckets={data}
                        processBlockData={processBlockData}
                        processBlockDataOptions={processBlockDataOptions}
                    />
                </ChartContainer>
            </DynamicDataLoader>
        </Block>
    )
}

export default ToolsExperienceRankingBlock
