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

export const useChartState = () => {
    const [highlighted, setHighlighted] = useState<string | null>(null)

    const [xMetric, setXMetric] = useState<string>('count')
    const [yMetric, setYMetric] = useState<string>('satisfaction')
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
