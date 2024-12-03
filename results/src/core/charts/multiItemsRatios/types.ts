import { DataSeries } from 'core/filters/types'
import { RatiosData, StandardQuestionData } from '@devographics/types'
import { Dispatch, SetStateAction } from 'react'
import {
    EditionWithPointData,
    VerticalBarChartValues,
    VerticalBarViewDefinition
} from '../verticalBar2/types'
import { LegendItem } from './Legend-old'

export type MultiRatioSerie = DataSeries<StandardQuestionData[]>

export type Ratios = keyof RatiosData

export enum Modes {
    VALUE = 'value',
    RANK = 'rank'
}

export interface MultiRatiosChartState {
    view: Ratios
    setView: Dispatch<SetStateAction<Ratios>>
    mode: Modes
    setMode: Dispatch<SetStateAction<Modes>>
    highlighted: string | null
    setHighlighted: Dispatch<SetStateAction<string | null>>
}

export type MultiRatiosChartValues = VerticalBarChartValues & { legendItems: LegendItem[] }

export type EditionWithRank = EditionWithPointData & {
    rank: number
}
