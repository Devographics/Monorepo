import { ChartStateWithHighlighted } from 'core/charts/common2/types'
import { Dispatch, SetStateAction, useState } from 'react'

export type ScatterplotChartState = ChartStateWithHighlighted & {
    highlighted: string | null
    setHighlighted: Dispatch<SetStateAction<string | null>>
    xMetric: string
    setXMetric: Dispatch<SetStateAction<string>>
    yMetric: string
    setYMetric: Dispatch<SetStateAction<string>>
    currentCategory: string | null
    setCurrentCategory: Dispatch<SetStateAction<string | null>>
    currentItem: string | null
    setCurrentItem: Dispatch<SetStateAction<string | null>>
    zoomedQuadrantIndex: number | null
    setZoomedQuadrantIndex: Dispatch<SetStateAction<number | null>>
}

export type UseChartStateProps = { defaultXMetric: string; defaultYMetric: string }

export const useChartState = ({ defaultXMetric, defaultYMetric }: UseChartStateProps) => {
    const [highlighted, setHighlighted] = useState<string | null>(null)

    const [xMetric, setXMetric] = useState<string>(defaultXMetric)
    const [yMetric, setYMetric] = useState<string>(defaultYMetric)
    const [currentCategory, setCurrentCategory] = useState<string | null>(null)
    const [currentItem, setCurrentItem] = useState<string | null>(null)
    const [zoomedQuadrantIndex, setZoomedQuadrantIndex] = useState<number | null>(null)

    const chartState: ScatterplotChartState = {
        highlighted,
        setHighlighted,
        xMetric,
        setXMetric,
        yMetric,
        setYMetric,
        currentCategory,
        setCurrentCategory,
        currentItem,
        setCurrentItem,
        zoomedQuadrantIndex,
        setZoomedQuadrantIndex
    }
    return chartState
}
