import React from 'react'
import { useTheme } from 'styled-components'
import TierListChart, { TierItemData, TierData } from 'core/charts/toolsTierList/TierListChart'
import sortBy from 'lodash/sortBy.js'
import { SectionMetadata, StandardQuestionData, FeaturesOptions } from '@devographics/types'
import { useToolSections } from 'core/helpers/metadata'
import { BlockComponentProps } from 'core/types/block'
import { DataSeries } from 'core/filters/types'
import { Ratios } from '../multiItemsRatios/types'
import { ChartFooter, ChartWrapper, Legend } from '../common2'
import ChartShare from '../common2/ChartShare'
import { useChartState } from './chartState'
import { useI18n } from '@devographics/react-i18n'

interface TierListBlockProps extends BlockComponentProps {
    series: DataSeries<StandardQuestionData[]>[]
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
    serie: DataSeries<StandardQuestionData[]>,
    theme: any,
    toolsSections: SectionMetadata[]
): TierData[] => {
    let sortedData = tiers.map((tier, index) => ({ ...tier, index, items: [] as TierItemData[] }))
    // remove native apps for this chart
    const items = serie.data.filter(tool => tool.id !== 'nativeapps')
    items.forEach(tool => {
        const total = tool?.responses?.currentEdition?.completion?.total || 0
        const buckets = tool?.responses?.currentEdition?.buckets
        const userCount = buckets?.find(b => b.id === FeaturesOptions.USED)?.count || 0
        const cutoff = Math.round((total * cutoffPercentage) / 100)
        const satisfactionRatio =
            (tool.responses.currentEdition.ratios?.[Ratios.RETENTION] || 0) * 100
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

const TierListBlock = (props: TierListBlockProps) => {
    const { getString } = useI18n()
    const { block, series, question } = props
    const theme = useTheme()
    const toolsSections = useToolSections()
    const chartData = getChartData(series[0], theme, toolsSections)
    const chartState = useChartState()
    const { highlighted: currentCategory } = chartState

    const legendItems = toolsSections.map(({ id }: SectionMetadata) => ({
        id,
        label: getString(`sections.${id}.title`)?.t,
        color: theme.colors.ranges.toolSections[id]
    }))

    return (
        <ChartWrapper question={question} className="tier-list">
            <>
                <Legend items={legendItems} chartState={chartState} />
                <TierListChart data={chartData} currentCategory={currentCategory} />
                <ChartFooter
                    right={
                        <>
                            <ChartShare block={block} />
                            {/* <ChartData {...commonProps} /> */}
                        </>
                    }
                />
            </>
        </ChartWrapper>
    )
}

export default TierListBlock
