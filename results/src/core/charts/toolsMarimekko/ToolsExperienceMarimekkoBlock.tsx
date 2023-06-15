import React from 'react'
import Block from 'core/blocks/block/BlockVariant'
import ChartContainer from 'core/charts/ChartContainer'
import {
    getChartData,
    ToolsExperienceMarimekkoChart,
    MARGIN,
    ROW_HEIGHT
} from './ToolsExperienceMarimekkoChart'
import { getTableData } from 'core/helpers/datatables'
import { useLegends } from 'core/helpers/legends'
import { SectionAllToolsData, ToolsOptions } from '@devographics/types'
import { useEntities } from 'core/helpers/entities'
import { BlockDefinition } from 'core/types'

const valueKeys = [
    'would_not_use_percentage',
    'not_interested_percentage',
    'would_use_percentage',
    'interested_percentage'
]

interface ToolsExperienceMarimekkoBlockProps {
    index: number
    block: BlockDefinition
    data: SectionAllToolsData
    triggerId: string | null
}

export const ToolsExperienceMarimekkoBlock = ({
    block,
    data,
    triggerId = null
}: ToolsExperienceMarimekkoBlockProps) => {
    const entities = useEntities()
    const chartData = getChartData({ data: data.items, entities })
    // make the height relative to the number of tools
    // in order to try to get consistent sizes across
    // the different sections, otherwise sections with
    // fewer tools would appear to have a better awareness
    // than those with more.
    const height = MARGIN.top + ROW_HEIGHT * data.items.length + MARGIN.bottom
    const controlledCurrent = triggerId

    const legends = useLegends({
        block,
        legendIds: Object.values(ToolsOptions),
        namespace: 'tools'
    })

    return (
        <Block
            block={block}
            data={data}
            tables={[
                getTableData({
                    data: getChartData({ data: data.items, makeAbsolute: true, entities }),
                    valueKeys
                })
            ]}
        >
            <ChartContainer height={height}>
                <ToolsExperienceMarimekkoChart
                    legends={legends}
                    data={data}
                    current={controlledCurrent}
                />
            </ChartContainer>
        </Block>
    )
}

export default ToolsExperienceMarimekkoBlock
