import React, { useState, useMemo } from 'react'
import { useTheme } from 'styled-components'
import Block from 'core/blocks/block/BlockVariant'
import TierListChart, { TierItemData } from 'core/charts/generic/TierListChart'
import { useI18n } from 'core/i18n/i18nContext'
import ChartContainer from 'core/charts/ChartContainer'
import sortBy from 'lodash/sortBy'
import { ToolsSectionId } from 'core/bucket_keys'
import { ToolsExperienceToolData } from '@types/survey_api/tools'
import { BlockContext } from 'core/blocks/types'

interface TierListBlockProps {
    block: BlockContext<'toolsTierListTemplate', 'ToolsTierListBlock', { toolIds: string }, any>
    data: ToolsExperienceToolData[]
}

// minimum user percentage of total respondents to consider for tier list
const cutoffPercentage = 10

const tiers = [
    { letter: 'S', upperBound: 100, lowerBound: 90 },
    { letter: 'A', upperBound: 89, lowerBound: 80 },
    { letter: 'B', upperBound: 79, lowerBound: 60 },
    { letter: 'C', upperBound: 59, lowerBound: 0 }
    // { letter: 'D', upperBound: 39, lowerBound: 0 }
]

/*

Parse data and convert it into a format compatible with the Scatterplot chart

*/
const getChartData = (data: ToolsExperienceToolData[], theme: any) => {
    let sortedData = tiers.map(tier => ({ ...tier, items: [] as TierItemData[] }))
    // remove native apps for this chart
    data = data.filter(tool => tool.id !== 'nativeapps')
    data.forEach(tool => {
        const total = tool?.experience?.year?.completion?.total
        const buckets = tool?.experience?.year?.facets[0].buckets
        const wouldUseCount = buckets?.find(b => b.id === 'would_use')?.count || 0
        const wouldNotUseCount = buckets?.find(b => b.id === 'would_not_use')?.count || 0
        const userCount = wouldUseCount + wouldNotUseCount
        const cutoff = Math.round((total * cutoffPercentage) / 100)
        const satisfactionRatio = Math.round((wouldUseCount / userCount) * 100)
        const categoryId = Object.keys(toolsCategories).find(categoryId =>
            toolsCategories[categoryId].includes(tool.id)
        )
        const color = categoryId ? theme.colors.ranges.toolSections[categoryId] : '#cccccc'
        if (userCount >= cutoff) {
            sortedData.forEach(tier => {
                if (satisfactionRatio >= tier.lowerBound && satisfactionRatio <= tier.upperBound) {
                    tier.items.push({ ...tool, userCount, satisfactionRatio, color, categoryId })
                }
            })
        }
    })
    sortedData = sortedData.map(tier => ({
        ...tier,
        items: sortBy(tier.items, 'satisfactionRatio').reverse()
    }))
    return sortedData
}

const TierListBlock = ({ block, data, context }: TierListBlockProps) => {
    const { translate } = useI18n()
    const theme = useTheme()

    const chartData = getChartData(data, theme)

    const total = data[0].experience?.year?.completion?.total

    const legends = Object.keys(toolsCategories).map(keyId => ({
        id: `toolCategories.${keyId}`,
        label: translate(`sections.${keyId}.title`),
        keyLabel: `${translate(`sections.${keyId}.title`)}:`,
        color: theme.colors.ranges.toolSections[keyId]
    }))

    const [currentCategory, setCurrentCategory] = useState<ToolsSectionId | null>(null)

    const legendProps = useMemo(
        () => ({
            legends,
            onMouseEnter: ({ id }: { id: string }) => {
                setCurrentCategory(id.replace('toolCategories.', '') as ToolsSectionId)
            },
            onMouseLeave: () => {
                setCurrentCategory(null)
            }
        }),
        [legends, setCurrentCategory]
    )

    return (
        <Block
            legends={legends}
            legendProps={legendProps}
            className="ToolsScatterplotBlock"
            data={data}
            // tables={[
            //     getTableData({
            //         data: data.map(tool => getNodeData(tool)),
            //         valueKeys: ['usage_count', 'satisfaction_percentage', 'interest_percentage']
            //     })
            // ]}
            block={block}
        >
            <ChartContainer vscroll={true} fit={true}>
                <TierListChart data={chartData} total={total} currentCategory={currentCategory} />
            </ChartContainer>
        </Block>
    )
}

export default TierListBlock
