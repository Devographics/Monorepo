import React from 'react'
import Block from 'core/blocks/block/BlockVariant'
import ChartContainer from 'core/charts/ChartContainer'
import { BlockContext } from 'core/blocks/types'
import { ToolsExperienceMarimekkoToolData } from './types'
import { ToolsExperienceMarimekkoChart, MARGIN, ROW_HEIGHT } from './ToolsExperienceMarimekkoChart'
import { getTableData } from 'core/helpers/datatables'
import keyBy from 'lodash/keyBy'
import round from 'lodash/round'
import sortBy from 'lodash/sortBy'
import { useLegends } from 'core/helpers/useBucketKeys'
import { SectionAllToolsData, ToolQuestionData, Entity } from '@devographics/types'
import { TOOLS_OPTIONS } from '@devographics/constants'
import { useEntities } from 'core/helpers/entities'

const valueKeys = [
    'would_not_use_percentage',
    'not_interested_percentage',
    'would_use_percentage',
    'interested_percentage'
]

/**
 * Convert raw API data to be compatible with nivo Marimekko chart.
 *
 * We also have to recompute the percentages as those returned by
 * the API are global, for this chart awareness is represented
 * using the thickness of the bars, so we want percentages relative
 * to awareness only.
 */
const getChartData = ({
    data,
    entities,
    makeAbsolute = false
}: {
    data: ToolQuestionData[]
    makeAbsolute?: boolean
    entities: Entity[]
}): ToolsExperienceMarimekkoToolData[] => {
    let chartData = data.map(tool => {
        const keyedBuckets = keyBy(tool.responses.currentEdition.buckets, 'id')
        const total = tool.responses.currentEdition.completion.total
        const neverheard = keyedBuckets?.never_heard?.count || 0
        const aware = total - neverheard

        const coeff = makeAbsolute ? 1 : -1
        const entity = entities.find(e => e.id === tool.id) || ({} as Entity)
        const toolData = {
            id: tool.id,
            entity,
            tool: { ...entity, id: tool.id },
            awareness: aware,
            would_not_use_percentage: round(
                ((keyedBuckets?.would_not_use?.count || 0) / aware) * 100 * coeff,
                1
            ),
            not_interested_percentage: round(
                ((keyedBuckets?.not_interested?.count || 0) / aware) * 100 * coeff,
                1
            ),
            interested_percentage: round(((keyedBuckets?.interested?.count || 0) / aware) * 100, 1),
            would_use_percentage: round(((keyedBuckets?.would_use?.count || 0) / aware) * 100, 1)
        }
        return toolData
    })

    // tools with the most positive experience come first,
    // interested users and users willing to use it again
    chartData = sortBy(chartData, datum => datum.interested_percentage + datum.would_use_percentage)
    chartData.reverse()

    return chartData
}

interface ToolsExperienceMarimekkoBlockProps {
    index: number
    block: BlockContext<
        'toolsExperienceMarimekkoTemplate',
        'ToolsExperienceMarimekkoBlock',
        { toolIds: string },
        any
    >
    data: SectionAllToolsData
    triggerId: string | null
}

export const ToolsExperienceMarimekkoBlock = ({
    block,
    data,
    triggerId = null
}: ToolsExperienceMarimekkoBlockProps) => {
    const entities = useEntities()
    const normalizedData = getChartData({ data: data.items, entities })
    // make the height relative to the number of tools
    // in order to try to get consistent sizes across
    // the different sections, otherwise sections with
    // fewer tools would appear to have a better awareness
    // than those with more.
    const height = MARGIN.top + ROW_HEIGHT * data.items.length + MARGIN.bottom
    const controlledCurrent = triggerId

    const legends = useLegends(block, TOOLS_OPTIONS, 'tools')
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
                    colorMapping={legends}
                    data={normalizedData}
                    current={controlledCurrent}
                />
            </ChartContainer>
        </Block>
    )
}
