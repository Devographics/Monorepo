import React, { memo, useState } from 'react'
import Block from 'core/blocks/block/BlockVariant'
import ChartContainer from 'core/charts/ChartContainer'
import HorizontalBarChart, { margin, getLeftMargin } from 'core/charts/generic/HorizontalBarChart'
import { getTableData } from 'core/helpers/datatables'
import { RatioBucketItem, BlockRatioUnits } from '@types/index'
import sortBy from 'lodash/sortBy'
import { useBarChart } from 'core/charts/hooks'
import {
    ToolsExperienceRankingBlockProps,
    ToolsExperienceRankingBlockData,
    ToolData
} from 'core/blocks/tools/ToolsExperienceRankingBlock'
import { ALL_METRICS } from 'core/helpers/units'
import ToolLabel from 'core/charts/tools/ToolLabel'
import HorizontalBarStripes from 'core/charts/generic/HorizontalBarStripes'

const ToolsLabels = props => {
    const { bars } = props
    return (
        <g>
            {bars.map(datum => (
                <g key={datum.data.data.id} transform={`translate(-160, ${datum.y})`}>
                    <foreignObject style={{ overflow: 'visible' }} width="1" height="1">
                        <ToolLabel
                            id={datum.data.data.id}
                            data={datum.data.data}
                            entity={datum?.data?.data.entity}
                        />
                    </foreignObject>
                </g>
            ))}
        </g>
    )
}

const getChartData = (
    data: ToolsExperienceRankingBlockData,
    units: BlockRatioUnits
): RatioBucketItem[] => {
    const chartData = data.experience.map((item: ToolData) => {
        const { id, entity } = item
        const dataPoint: RatioBucketItem = {
            id,
            entity
        }
        ALL_METRICS.forEach(metric => {
            dataPoint[`${metric}_percentage`] = item[metric][0]['percentageQuestion']
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
        chartNamespace: i18nNamespace = block.blockNamespace ?? block.id
    } = block

    const [units, setUnits] = useState(defaultUnits)

    const buckets = getChartData(data, units)
    const total = 100

    const keys = ALL_METRICS.map(m => `${m}_percentage`)

    const { formatValue } = useBarChart({
        buckets,
        total,
        i18nNamespace,
        shouldTranslate: translateData,
        mode,
        units
    })

    const left =
        getLeftMargin({ data: buckets, shouldTranslate: translateData, i18nNamespace }) + 20

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
                    i18nNamespace={i18nNamespace}
                    translateData={translateData}
                    mode={mode}
                    units={controlledUnits ?? units}
                    colorVariant={isCustom ? 'secondary' : 'primary'}
                    chartProps={{
                        margin: { ...margin, left },
                        axisBottom: {
                            tickValues: 5,
                            format: formatValue,
                            // legend: translate(`charts.axis_legends.users_${units}`),
                            legendPosition: 'middle',
                            legendOffset: 40
                        },
                        layers: [
                            layerProps => <HorizontalBarStripes {...layerProps} />,
                            'grid',
                            // 'axes',
                            ToolsLabels,
                            'bars'
                        ]
                    }}
                />
            </ChartContainer>
        </Block>
    )
}

export default memo(ToolsExperienceRankingSingleYearBlock)
