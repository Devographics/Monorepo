import React, { memo, useCallback, useMemo } from 'react'
import { useTheme } from 'styled-components'
import { ResponsiveScatterPlot } from '@nivo/scatterplot'
import { useI18n } from 'core/i18n/i18nContext'
import { ToolsScatterPlotSeries, ToolsScatterPlotTool, ToolsScatterPlotMetric } from './types'
import { ToolsScatterPlotContextProvider, useToolsScatterPlot } from './state'
import { Nodes } from './Nodes'
import { Quadrants } from './Quadrants'
import { staticProps } from './config'
import { Crosshair } from './Crosshair'
import { ToolsSectionId } from 'core/bucket_keys'

interface ToolsScatterPlotProps {
    data: ToolsScatterPlotSeries[]
    metric: ToolsScatterPlotMetric
    currentCategory: string | null
    setCurrentCategory: (category: string | null) => void
    className: string
    showQuadrants: boolean
}

// Custom chart layers, layers expressed as strings
// correspond to nivo default layers.
const layers = [
    Quadrants,
    'grid' as const,
    'axes' as const,
    Nodes,
    Crosshair,
]

/**
 * This chart classifies tools into 4 categories (quadrants):
 * - Assess
 * - Adopt
 * - Avoid
 * - Analyze
 *
 * The quadrant a tool is in depends on 2 metrics, satisfaction (%)
 * and number of users.
 *
 * We have the ability to highlight a specific tool on hover,
 * this will then show a crosshair indicator, this is managed
 * by the `Crosshair` layer.
 *
 * We can also highlight a whole category, which is managed
 * higher in the tree via the chart's legend.
 *
 * As a quadrant can get pretty crowded depending on the results,
 * we have the ability to zoom on a specific quadrant
 * by clicking on it.
 *
 * Please note that this chart is an heavily customized version
 * of the nivo ScatterPlot component, it relies on custom
 * layers and has extra state management for the current tool/category
 * and zoomed quadrant, please see `state.ts` for more information.
 */
const NonMemoizedToolsScatterPlot = ({
    data,
    metric = 'satisfaction',
    currentCategory,
    setCurrentCategory,
    className,
}: ToolsScatterPlotProps) => {
    const { xScale, yScale, context } = useToolsScatterPlot({
        metric,
        currentCategory,
        setCurrentCategory,
    })

    const theme = useTheme()
    const getColor = useCallback(({ serieId }: { serieId: string | number }) =>
        theme.colors.ranges.toolSections[serieId as ToolsSectionId], [theme])

    const { translate } = useI18n()
    const axes = useMemo(() => ({
        left: {
            legend: translate!(`charts.axis_legends.${metric}_percentage`),
            legendPosition: 'middle' as const,
            legendOffset: -60,
            format: staticProps.formatPercentage,
        },
        bottom: {
            legend: translate!('charts.axis_legends.users_count'),
            legendPosition: 'middle' as const,
            legendOffset: 46,
        },
    }), [translate])

    // reset the current category & tool when leaving the chart
    const handleChartLeave = useCallback(() => {
        setCurrentCategory(null)
        context.setCurrentTool(null)
    }, [setCurrentCategory, context.setCurrentTool])

    return (
        <ToolsScatterPlotContextProvider value={context}>
            <div
                style={staticProps.containerStyle}
                className={className}
                onMouseLeave={handleChartLeave}
            >
                <ResponsiveScatterPlot<ToolsScatterPlotTool>
                    data={data}
                    margin={staticProps.margin}
                    xScale={xScale}
                    yScale={yScale}
                    yFormat={staticProps.formatPercentage}
                    theme={theme.charts}
                    axisTop={null}
                    axisRight={null}
                    axisBottom={axes.bottom}
                    axisLeft={axes.left}
                    layers={layers}
                    colors={getColor}
                    useMesh={false}
                    isInteractive={false}
                    motionConfig="gentle"
                />
            </div>
        </ToolsScatterPlotContextProvider>
    )
}

export const ToolsScatterPlot = memo(NonMemoizedToolsScatterPlot)

