import React from 'react'
import { AllToolsData, QuestionMetadata, StandardQuestionData } from '@devographics/types'
import { useToolSections } from 'core/helpers/metadata'
import { useI18n } from '@devographics/react-i18n'
import { useTheme } from 'styled-components'
import { DataSeries } from 'core/filters/types'
import { ChartFooter, ChartWrapper, Legend, Note } from '../common2'
import ChartShare from '../common2/ChartShare'
import { BlockComponentProps } from 'core/types'
import { useChartState, ScatterplotChart, GetNodeProps } from '../scatterplot'
import { NodeData } from '../scatterplot/types'
import { formatQuestionValue } from '../common2/helpers/format'
import { useQuestionById } from 'core/helpers/options'
import { getItemLabel } from 'core/helpers/labels'
import { getQuestionLabel } from '../common2/helpers/labels'
import { getDistinctColor } from '../common2/helpers/colors'
import uniq from 'lodash/uniq.js'

const useNodes = ({
    items,
    question,
    block,
    data,
    chartState,
    axis1Formatter,
    axis2Formatter
}: GetNodeProps) => {
    const { highlighted, currentItem } = chartState

    const { getString } = useI18n()
    const theme = useTheme()

    const buckets1 = data[0].combined.allEditions?.[0].buckets
    const buckets2 = data[1].combined.allEditions?.[0].buckets

    const i18nNamespace = block.i18nNamespace || question.id

    const groups = uniq(items.map(item => item.group))

    console.log(groups)
    const nodes: NodeData[] = items.map((item, index) => {
        const { id, group, color } = item
        const isCurrentItem = currentItem === id

        const bucket1Item = buckets1.find(b => b.id === id)
        const bucket2Item = buckets2.find(b => b.id === id)

        const isHighlighted = id === highlighted

        const xValue = bucket1Item?.averageByFacet || 0
        const yValue = bucket2Item?.averageByFacet || 0

        const formattedX = axis1Formatter(xValue)
        const formattedY = axis2Formatter(yValue)

        const serieIndex = 0
        const serieId = 'dummy_serie_id'

        const labelObject = getItemLabel({ id, i18nNamespace, getString })

        const nodeData: NodeData = {
            index,
            id,
            serieIndex,
            serieId,
            label: labelObject?.shortLabel,
            xValue,
            formattedX,
            yValue,
            formattedY,
            color: color || '#ffffffaa',
            isCurrentItem,
            isHighlighted
        }
        if (group) {
            nodeData.categoryId = group
        }
        return nodeData
    })
    return nodes
}

export const TwoSeriesScatterplot = (
    props: BlockComponentProps & {
        question: QuestionMetadata
        data: AllToolsData
        series: DataSeries<StandardQuestionData>[]
        // used for the report, to control which category is highlighted
    }
) => {
    const { getString } = useI18n()
    const { block, series, question } = props
    const { options } = question
    const data = series.map(serie => serie.data)

    const question1Id = block?.series?.[0]?.facet?.id
    const question1 = useQuestionById(question1Id)
    if (!question1) {
        throw new Error(`Could not find question1 with id ${question1Id}`)
    }

    const question2Id = block?.series?.[1]?.facet?.id
    const question2 = useQuestionById(question2Id)
    if (!question2) {
        throw new Error(`Could not find question2 with id ${question2Id}`)
    }

    const axis1Formatter = (v: number) => formatQuestionValue(v, question1)
    const axis2Formatter = (v: number) => formatQuestionValue(v, question2)

    const q1Label = getQuestionLabel({ getString, question: question1 })?.questionName
    const q2Label = getQuestionLabel({ getString, question: question2 })?.questionName

    const axis1Label = getString(`charts.axis_legends.average_value`, {
        values: { axis: q1Label }
    })?.t
    const axis2Label = getString(`charts.axis_legends.average_value`, {
        values: { axis: q2Label }
    })?.t

    const theme = useTheme()

    const chartState = useChartState({
        defaultXMetric: 'averageByFacet',
        defaultYMetric: 'averageByFacet'
    })

    // legend
    const groups = options && uniq(options.map(option => option.group))
    const i18nNamespace = block.i18nNamespace || question.id
    const bucketIds = data[0].combined.allEditions?.[0].buckets.map(b => b.id)
    const items = bucketIds.map((id, index) => {
        const labelObject = getItemLabel({ id, i18nNamespace, getString })
        const option = options?.find(option => option.id === id)
        let color
        if (option && groups) {
            const groupIndex = groups.findIndex(group => group === option.group)
            const groupColor = getDistinctColor(theme.colors.distinct, groupIndex)
            color = groupColor
        } else {
            color = getDistinctColor(theme.colors.distinct, index)
        }
        return {
            id,
            label: labelObject?.shortLabel,
            color,
            group: option?.group
        }
    })

    return (
        <ChartWrapper {...props} chartState={chartState}>
            <>
                <Legend<ScatterplotChartState>
                    items={items}
                    chartState={chartState}
                    i18nNamespace={i18nNamespace}
                />

                <ScatterplotChart
                    block={block}
                    question={question}
                    items={items}
                    chartState={chartState}
                    data={data}
                    useNodes={useNodes}
                    axis1Formatter={axis1Formatter}
                    axis2Formatter={axis2Formatter}
                    axis1Label={axis1Label}
                    axis2Label={axis2Label}
                />

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

export default TwoSeriesScatterplot
