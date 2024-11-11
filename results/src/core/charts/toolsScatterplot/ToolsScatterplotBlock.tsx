import './Scatterplot.scss'
import React from 'react'
import { ToolsScatterplotBlockData } from './types'
import { useChartData } from './hooks'
import ToolsQuadrantsChart from './ToolsScatterplotChart'
import { AllToolsData, SectionMetadata, StandardQuestionData } from '@devographics/types'
import { useToolSections } from 'core/helpers/metadata'
import { useI18n } from '@devographics/react-i18n'
import { useTheme } from 'styled-components'
import { DataSeries } from 'core/filters/types'
import { ChartFooter, ChartWrapper, Legend, Note } from '../common2'
import ChartShare from '../common2/ChartShare'
import { useChartState } from './chartState'
import { BlockComponentProps } from 'core/types'

export const ToolsScatterplotBlock = ({
    block,
    series,
    question
}: BlockComponentProps & {
    data: AllToolsData
    series: DataSeries<StandardQuestionData[]>[]
    // used for the report, to control which category is highlighted
}) => {
    const { data } = series[0]

    const { getString } = useI18n()
    const theme = useTheme()
    const toolSections = useToolSections()
    const metric = 'retention'
    const chartData = useChartData(data, metric)
    // const tabularData = useTabularData(data, metric)

    const chartState = useChartState()
    const { highlighted, setHighlighted } = chartState
    const legendItems = toolSections.map((section: SectionMetadata) => ({
        id: section.id,
        label: getString(`sections.${section.id}.title`)?.t,
        color: theme.colors.ranges.toolSections[section.id]
    }))

    return (
        <ChartWrapper question={question}>
            <>
                <Legend items={legendItems} chartState={chartState} />

                <ToolsQuadrantsChart
                    className={`ToolsScatterplotChart `}
                    data={chartData}
                    metric={metric}
                    currentCategory={highlighted}
                    setCurrentCategory={setHighlighted}
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

export default ToolsScatterplotBlock
