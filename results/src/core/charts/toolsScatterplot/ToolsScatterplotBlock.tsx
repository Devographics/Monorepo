import './Scatterplot.scss'
import React from 'react'
import { AllToolsData, SectionMetadata, StandardQuestionData } from '@devographics/types'
import { useToolSections } from 'core/helpers/metadata'
import { useI18n } from '@devographics/react-i18n'
import { useTheme } from 'styled-components'
import { DataSeries } from 'core/filters/types'
import { ChartFooter, ChartWrapper, Legend, Note } from '../common2'
import ChartShare from '../common2/ChartShare'
import { BlockComponentProps } from 'core/types'
import {
    ScatterplotChartState,
    useChartState,
    ScatterplotChart,
    ScatterplotChartValues
} from '../scatterplot'
import { NodeData } from '../scatterplot/types'

export type GetNodeProps = {
    data: StandardQuestionData[]
    chartState: ScatterplotChartState
    chartValues: ScatterplotChartValues
}
const useNodes = ({ data, chartState, chartValues }: GetNodeProps) => {
    const { highlighted: currentCategory, currentItem } = chartState

    const toolSections = useToolSections()
    const theme = useTheme()

    const { xScale, yScale } = chartValues

    const nodes: NodeData[] = data.map((item, index) => {
        const { id, entity, responses } = item

        const isCurrentItem = currentItem === id
        const isHighlighted =
            currentCategory !== null &&
            toolSections
                ?.find((s: SectionMetadata) => s.id === currentCategory)
                .questions.find((q: QuestionMetadata) => q.id === id)

        const xValue = responses?.currentEdition?.buckets?.find(b => b.id === 'used')?.count || 0
        const yValue = responses?.currentEdition?.ratios?.['retention'] || 0

        const formattedX = formatNumber(xValue)
        const formattedY = formatPercentage(yValue * 100)

        const x = xScale(xValue)
        const y = yScale(yValue * 100)

        const category =
            toolSections.find(section => {
                return section.questions.find(q => q.id === id)
            }) || ({ id: 'no_category_found' } as SectionMetadata)
        const categoryId = category.id

        const color = theme.colors.ranges.toolSections[categoryId]

        const serieIndex = 0
        const serieId = 'dummy_serie_id'

        const nodeData: NodeData = {
            index,
            id,
            category,
            serieIndex,
            serieId,
            categoryId,
            label: entity.nameClean || entity.name,
            x,
            xValue,
            formattedX,
            y,
            yValue,
            formattedY,
            color,
            isCurrentItem,
            isHighlighted
        }
        return nodeData
    })
    return nodes
}

export const ToolsScatterplotBlock = (
    props: BlockComponentProps & {
        data: AllToolsData
        series: DataSeries<StandardQuestionData[]>[]
        // used for the report, to control which category is highlighted
    }
) => {
    const { block, series, question } = props
    const { data } = series[0]

    const { getString } = useI18n()
    const theme = useTheme()
    const toolSections = useToolSections()

    const chartState = useChartState()

    const legendItems = toolSections.map((section: SectionMetadata) => ({
        id: section.id,
        label: getString(`sections.${section.id}.title`)?.t,
        color: theme.colors.ranges.toolSections[section.id]
    }))

    return (
        <ChartWrapper {...props} chartState={chartState}>
            <>
                <Legend<ScatterplotChartState> items={legendItems} chartState={chartState} />

                <ScatterplotChart chartState={chartState} data={data} useNodes={useNodes} />

                <Note block={block} />
                <ChartFooter
                    right={
                        <>
                            <ChartShare block={block} />
                        </>
                    }
                />
            </>
        </ChartWrapper>
    )
}

export default ToolsScatterplotBlock
