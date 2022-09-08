import React, { memo, useState } from 'react'
import Block from 'core/blocks/block/BlockVariant'
import ChartContainer from 'core/charts/ChartContainer'
import HorizontalBarChart from 'core/charts/generic/HorizontalBarChart'
import { getTableData } from 'core/helpers/datatables'
import { RatioBucketItem, BlockRatioUnits } from 'core/types'
import sortBy from 'lodash/sortBy'
import { useBarChart } from 'core/charts/hooks'
import { ToolsExperienceRankingBlockProps, ToolsExperienceRankingBlockData, ToolData } from 'core/blocks/tools/ToolsExperienceRankingBlock'
import { ALL_METRICS } from 'core/helpers/units'

const getChartData = (data: ToolsExperienceRankingBlockData, units: BlockRatioUnits) : RatioBucketItem[] => {
    const chartData = data.experience.map((item: ToolData) => {
        const { id, entity } = item
        const dataPoint: RatioBucketItem = {
            id,
            entity
        }
        ALL_METRICS.forEach(metric => {
            dataPoint[`${metric}_percentage`] = item[metric][0]['percentage_question']
        })
        return dataPoint
    })
    const sortedChartData = sortBy(chartData, units)
    return sortedChartData
}

const ToolsExperienceRankingSingleYearBlock = ({
    block,
    data,
    controlledUnits,
    isCustom
}: ToolsExperienceRankingBlockProps) => {
    const {
        mode = 'relative',
        defaultUnits = 'satisfaction_percentage',
        translateData,
        chartNamespace = block.blockNamespace ?? block.id,
    } = block

    const [units, setUnits] = useState(defaultUnits)

    const buckets = getChartData(data, units)
    const total = 100

    const keys = ALL_METRICS.map(m => `${m}_percentage`)
    
    const { formatValue } = useBarChart({
        buckets,
        total,
        i18nNamespace: chartNamespace,
        shouldTranslate: translateData,
        mode,
        units
    })

    return (
        <Block
            units={controlledUnits ?? units}
            setUnits={setUnits}
            unitsOptions={keys}
            data={buckets}
            tables={[
                getTableData({
                    data: buckets,
                    valueKeys: keys
                })
            ]}
            block={block}
            // completion={completion}
        >
            <ChartContainer fit={false}>
                <HorizontalBarChart
                    total={total}
                    buckets={buckets}
                    i18nNamespace={chartNamespace}
                    translateData={translateData}
                    mode={mode}
                    units={controlledUnits ?? units}
                    colorVariant={isCustom ? 'secondary' : 'primary'}
                    chartProps={{ axisBottom: {
                        tickValues: 5,
                        format: formatValue,
                        // legend: translate(`charts.axis_legends.users_${units}`),
                        legendPosition: 'middle',
                        legendOffset: 40} }}
                />
            </ChartContainer>
        </Block>
    )
}

export default memo(ToolsExperienceRankingSingleYearBlock)
