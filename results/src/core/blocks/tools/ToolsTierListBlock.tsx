import React, { useState, useMemo } from 'react'
import { useTheme } from 'styled-components'
import Block from 'core/blocks/block/BlockVariant'
import TierListChart, { TierItemData, TierData } from 'core/charts/generic/TierListChart'
import { useI18n } from 'core/i18n/i18nContext'
import ChartContainer from 'core/charts/ChartContainer'
import sortBy from 'lodash/sortBy.js'
import { BlockContext } from 'core/blocks/types'
import { QuestionData, SectionMetadata } from '@devographics/types'
import { useToolSections } from 'core/helpers/metadata'
import { BlockComponentProps } from 'core/types/block'

interface TierListBlockProps extends BlockComponentProps {
    block: BlockContext<'toolsTierListTemplate', 'ToolsTierListBlock', { toolIds: string }, any>
    data: QuestionData[]
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

Parse data and convert it into a format compatible with the TierList chart

*/
const getChartData = (
    data: QuestionData[],
    theme: any,
    toolsSections: SectionMetadata[]
): TierData[] => {
    let sortedData = tiers.map((tier, index) => ({ ...tier, index, items: [] as TierItemData[] }))
    // remove native apps for this chart
    data = data.filter(tool => tool.id !== 'nativeapps')
    data.forEach(tool => {
        const total = tool?.responses?.currentEdition?.completion?.total || 0
        const buckets = tool?.responses?.currentEdition?.buckets
        const wouldUseCount = buckets?.find(b => b.id === 'would_use')?.count || 0
        const wouldNotUseCount = buckets?.find(b => b.id === 'would_not_use')?.count || 0
        const userCount = wouldUseCount + wouldNotUseCount
        const cutoff = Math.round((total * cutoffPercentage) / 100)
        const satisfactionRatio = Math.round((wouldUseCount / userCount) * 100)
        const section = toolsSections.find((section: SectionMetadata) =>
            section.questions.find(q => q.id === tool.id)
        )
        if (!section) {
            throw Error(`Could not find section for tool id ${tool.id}`)
        }
        const sectionId = section.id
        const color = sectionId ? theme.colors.ranges.toolSections[sectionId] : '#cccccc'
        if (userCount >= cutoff) {
            sortedData.forEach(tier => {
                if (satisfactionRatio >= tier.lowerBound && satisfactionRatio <= tier.upperBound) {
                    tier.items.push({
                        ...tool,
                        userCount,
                        satisfactionRatio,
                        color,
                        sectionId
                    })
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

const TierListBlock = ({ block, data }: TierListBlockProps) => {
    const { translate } = useI18n()
    const theme = useTheme()

    const toolsSections = useToolSections()
    const chartData = getChartData(data, theme, toolsSections)

    const legends = toolsSections.map(({ id }: SectionMetadata) => ({
        id: `toolCategories.${id}`,
        label: translate(`sections.${id}.title`),
        keyLabel: `${translate(`sections.${id}.title`)}:`,
        color: theme.colors.ranges.toolSections[id]
    }))

    const [currentCategory, setCurrentCategory] = useState<string | null>(null)

    const legendProps = useMemo(
        () => ({
            legends,
            onMouseEnter: ({ id }: { id: string }) => {
                setCurrentCategory(id.replace('toolCategories.', ''))
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
                <TierListChart data={chartData} currentCategory={currentCategory} />
            </ChartContainer>
        </Block>
    )
}

export default TierListBlock
