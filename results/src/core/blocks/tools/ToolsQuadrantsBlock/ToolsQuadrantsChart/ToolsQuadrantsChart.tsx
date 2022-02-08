import React, { useCallback, useMemo } from 'react'
import { useTheme } from 'styled-components'
import { ResponsiveScatterPlot } from '@nivo/scatterplot'
import { useI18n } from 'core/i18n/i18nContext'
import { ToolsSectionId } from 'core/bucket_keys'
import { ToolsQuadrantsMetric, ToolsQuadrantsChartToolsCategoryData, ToolsQuadrantsChartToolData } from '../types'
import { staticProps } from './config'
import { ToolsQuadrantsChartContextProvider, useToolsQuadrantsChart } from './state'
import { Quadrants } from './Quadrants'
import { Nodes } from './Nodes'
import { Crosshair } from './Crosshair'

interface ToolsScatterPlotProps {
    data: ToolsQuadrantsChartToolsCategoryData[]
    metric: ToolsQuadrantsMetric
    currentCategory: ToolsSectionId | null
    setCurrentCategory: (category: ToolsSectionId | null) => void
    className: string
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
 * This chart classifies tools into 4 categories (quadrants)
 * depending on the selected metric:
 *
 *   +––––––––––+––––––––––––––+––––––––––––––––+
 *   | Quadrant | satisfaction | interest       |
 *   +––––––––––+––––––––––––––+––––––––––––––––+
 *   |        0 | assess       | mainstream     |
 *   |        1 | adopt        | next_big_thing |
 *   |        2 | avoid        | unknown        |
 *   |        3 | analyze      | low_interest   |
 *   +––––––––––+––––––––––––––+––––––––––––––––+
 *
 * The quadrant a tool is in depends on 2 metrics, satisfaction
 * or interest (%) and number of users.
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
export const ToolsQuadrantsChart = ({
    data,
    metric,
    currentCategory,
    setCurrentCategory,
    className,
}: ToolsScatterPlotProps) => {
    const { xScale, yScale, context } = useToolsQuadrantsChart({
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
    }), [translate, metric])

    // reset the current category & tool when leaving the chart
    const handleChartLeave = useCallback(() => {
        setCurrentCategory(null)
        context.setCurrentTool(null)
    }, [setCurrentCategory, context.setCurrentTool])

    return (
        <ToolsQuadrantsChartContextProvider value={context}>
            <div
                style={staticProps.containerStyle}
                className={className}
                onMouseLeave={handleChartLeave}
            >
                <ResponsiveScatterPlot<ToolsQuadrantsChartToolData>
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
        </ToolsQuadrantsChartContextProvider>
    )
}
