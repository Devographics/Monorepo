import { DataSeries } from 'core/filters/types'
import { RatiosData, RatiosEnum, StandardQuestionData } from '@devographics/types'
import { Dispatch, SetStateAction } from 'react'
import { EditionWithPointData, VerticalBarChartValues } from '../verticalBar2/types'
import { ChartStateWithHighlighted, ChartStateWithSubset, LegendItem } from '../common2/types'

export type MultiRatioSerie = DataSeries<StandardQuestionData[]>

export type Ratios = keyof RatiosData

export enum ModesEnum {
    VALUE = 'value',
    RANK = 'rank'
}

export type MultiRatiosChartState = {
    view: RatiosEnum
    setView: Dispatch<SetStateAction<RatiosEnum>>
    mode: ModesEnum
    setMode: Dispatch<SetStateAction<ModesEnum>>
} & ChartStateWithSubset &
    ChartStateWithHighlighted

export type MultiRatiosChartValues = VerticalBarChartValues & { legendItems: LegendItem[] }

export type EditionWithRankAndPointData = EditionWithPointData & {
    value: number
    rank: number
}
