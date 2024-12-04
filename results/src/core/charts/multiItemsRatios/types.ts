import { DataSeries } from 'core/filters/types'
import { RatiosData, RatiosEnum, StandardQuestionData } from '@devographics/types'
import { Dispatch, SetStateAction } from 'react'
import { EditionWithPointData, VerticalBarChartValues } from '../verticalBar2/types'
import { LegendItem } from '../common2/types'

export type MultiRatioSerie = DataSeries<StandardQuestionData[]>

export type Ratios = keyof RatiosData

export enum ModesEnum {
    VALUE = 'value',
    RANK = 'rank'
}

export interface MultiRatiosChartState {
    view: RatiosEnum
    setView: Dispatch<SetStateAction<RatiosEnum>>
    mode: ModesEnum
    setMode: Dispatch<SetStateAction<ModesEnum>>
    highlighted: string | null
    setHighlighted: Dispatch<SetStateAction<string | null>>
}

export type MultiRatiosChartValues = VerticalBarChartValues & { legendItems: LegendItem[] }

export type EditionWithRankAndPointData = EditionWithPointData & {
    rank: number
}
