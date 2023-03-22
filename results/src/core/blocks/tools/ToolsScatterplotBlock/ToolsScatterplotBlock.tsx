import React, { useMemo, useState } from 'react'
import Block from 'core/blocks/block/BlockVariant'
import ChartContainer from 'core/charts/ChartContainer'
import { ToolsSectionId } from 'core/bucket_keys'
import { ToolsScatterplotBlockData, ToolsQuadrantsMetric } from './types'
import { useChartData, useTabularData } from './hooks'
import { ToolsQuadrantsChart } from './ToolsScatterplotChart'
import { AllToolsData, SectionMetadata } from '@devographics/types'
import { useToolSections } from 'core/helpers/metadata'
import { useI18n } from 'core/i18n/i18nContext'
import { useTheme } from 'styled-components'

const ENABLE_METRIC_SWITCH = false

export const ToolsScatterplotBlock = ({
    block,
    data,
    triggerId
}: {
    block: ToolsScatterplotBlockData
    data: AllToolsData
    // used for the report, to control which category is highlighted
    triggerId?: ToolsSectionId
}) => {
    const { translate } = useI18n()
    const theme = useTheme()
    const toolSections = useToolSections()
    const [metric, setMetric] = useState<ToolsQuadrantsMetric>('satisfaction')
    const modeProps = useMemo(
        () => ({
            units: metric,
            options: ['satisfaction', 'interest'],
            onChange: setMetric,
            i18nNamespace: 'options.experience_ranking'
        }),
        [metric, setMetric]
    )

    const chartData = useChartData(data.items, metric)
    const tabularData = useTabularData(data.items, metric)

    const [currentCategory, setCurrentCategory] = useState<ToolsSectionId | null>(null)
    const controlledCurrentCategory = triggerId || currentCategory

    const chartClassName = controlledCurrentCategory
        ? `ToolsScatterplotChart--${controlledCurrentCategory}`
        : ''

    const legends = toolSections.map((section: SectionMetadata) => ({
        id: `toolCategories.${section.id}`,
        label: translate(`sections.${section.id}.title`),
        keyLabel: `${translate(`sections.${section.id}.title`)}:`,
        color: theme.colors.ranges.toolSections[section.id]
    }))

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
