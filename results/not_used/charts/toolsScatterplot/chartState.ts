import { Dispatch, SetStateAction, useState } from 'react'

export type ScatterplotChartState = {
    highlighted: string | null
    setHighlighted: Dispatch<SetStateAction<string | null>>
}
export const useChartState = () => {
    const [highlighted, setHighlighted] = useState<string | null>(null)

    const chartState: ScatterplotChartState = {
        highlighted,
        setHighlighted
    }
    return chartState
}
