import React, { useMemo, useState } from 'react'
import Block from 'core/blocks/block/BlockVariant'
import ChartContainer from 'core/charts/ChartContainer'
import { ToolsSectionId } from 'core/bucket_keys'
import { ToolsQuadrantsBlockData, ToolsQuadrantsApiDatum, ToolsQuadrantsMetric } from './types'
import { useChartData, useChartLegends, useTabularData } from './hooks'
import { ToolsQuadrantsChart } from './ToolsQuadrantsChart'

const ENABLE_METRIC_SWITCH = false

export const ToolsQuadrantsBlock = ({
    block,
    data,
    triggerId,
}: {
    block: ToolsQuadrantsBlockData
    data: ToolsQuadrantsApiDatum[]
    // used for the report, to control which category is highlighted
    triggerId?: ToolsSectionId
}) => {
    const [metric, setMetric] = useState<ToolsQuadrantsMetric>('satisfaction')
    const modeProps = useMemo(() => ({
        units: metric,
        options: ['satisfaction', 'interest'],
        onChange: setMetric,
        i18nNamespace: 'options.experience_ranking',
    }), [metric, setMetric])

    const chartData = useChartData(data, metric)
    const tabularData = useTabularData(data, metric)

    const [currentCategory, setCurrentCategory] = useState<ToolsSectionId | null>(null)
    const controlledCurrentCategory = triggerId || currentCategory

    const chartClassName = controlledCurrentCategory ? `ToolsScatterplotChart--${controlledCurrentCategory}` : ''

    const legends = useChartLegends()
    const legendProps = useMemo(() => ({
        legends,
        onMouseEnter: ({ id }: { id: string }) => {
            setCurrentCategory(id.replace('toolCategories.', '') as ToolsSectionId)
        },
        onMouseLeave: () => {
            setCurrentCategory(null)
        },
    }), [legends, setCurrentCategory])

    return (
        <Block
            className="ToolsScatterplotBlock"
            data={data}
            tables={tabularData}
            block={{ ...block, blockName: 'tools_quadrant' }}
            legends={legends}
            legendProps={legendProps}
            modeProps={ENABLE_METRIC_SWITCH ? modeProps : undefined}
        >
            <ChartContainer vscroll={false}>
                <ToolsQuadrantsChart
                    className={`ToolsScatterplotChart ${chartClassName}`}
                    data={chartData}
                    metric={metric}
                    currentCategory={controlledCurrentCategory}
                    setCurrentCategory={setCurrentCategory}
                />
            </ChartContainer>
        </Block>
    )
}
