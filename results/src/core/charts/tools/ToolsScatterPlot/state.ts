import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { ToolsScatterPlotMetric } from './types'
import { baseScales, quadrantsConfig } from './config'

export interface ToolsScatterPlotContextData {
    metric: ToolsScatterPlotMetric
    currentCategory: string | null
    setCurrentCategory: (category: string | null) => void
    currentTool: string | null
    setCurrentTool: (tool: string | null) => void
    zoomedQuadrantIndex: number | null
    toggleQuadrantZoom: (quadrantIndex: number) => void
}

// @ts-ignore
export const ToolsScatterPlotContext = createContext<ToolsScatterPlotContextData>(null)

export const ToolsScatterPlotContextProvider = ToolsScatterPlotContext.Provider

export const useToolsScatterPlotContext = () => useContext(ToolsScatterPlotContext)

export const useToolsScatterPlot = ({
    metric,
    currentCategory,
    setCurrentCategory,
}: {
    metric: ToolsScatterPlotMetric
    currentCategory: string | null
    setCurrentCategory: (category: string | null) => void
}) => {
    // used to highlight a specific tool
    const [currentTool, setCurrentTool] = useState<string | null>(null)

    // used to zoom on a specific quadrant, `null` means no zoom
    const [zoomedQuadrantIndex, setZoomedQuadrantIndex] = useState<number | null>(null)

    const toggleQuadrantZoom = useCallback((quadrantIndex: number) => {
        setZoomedQuadrantIndex(current => {
            if (quadrantIndex === current) return null
            return quadrantIndex
        })
    }, [setZoomedQuadrantIndex])

    const { xScale, yScale } = useMemo(() => {
        let _xScale: {
            type: 'linear'
            min: number
            max: number
        }
        let _yScale: {
            type: 'linear'
            min: number
            max: number
        }

        if (zoomedQuadrantIndex !== null) {
            const zoomedQuadrantConfig = quadrantsConfig[zoomedQuadrantIndex]

            _xScale = {
                type: 'linear',
                min: zoomedQuadrantConfig.xZoomRange[0],
                max: zoomedQuadrantConfig.xZoomRange[1],
            }
            _yScale = {
                type: 'linear',
                min: zoomedQuadrantConfig.yZoomRange[0],
                max: zoomedQuadrantConfig.yZoomRange[1],
            }
        } else {
            // using default full scales
            _xScale = {
                type: 'linear',
                min: baseScales.xRange[0],
                max: baseScales.xRange[1],
            }
            _yScale = {
                type: 'linear',
                min: baseScales.yRange[0],
                max: baseScales.yRange[1],
            }
        }

        return {
            xScale: _xScale,
            yScale: _yScale,
        }
    }, [zoomedQuadrantIndex])

    const context: ToolsScatterPlotContextData = useMemo(() => ({
        metric,
        currentCategory,
        setCurrentCategory,
        currentTool,
        setCurrentTool,
        zoomedQuadrantIndex,
        toggleQuadrantZoom,
    }), [
        metric,
        currentCategory,
        setCurrentCategory,
        currentTool,
        setCurrentTool,
        zoomedQuadrantIndex,
        toggleQuadrantZoom,
    ])

    return {
        xScale,
        yScale,
        context,
    }
}