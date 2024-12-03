import { DataSeries } from 'core/filters/types'
import { QuestionMetadata, ResponseEditionData, StandardQuestionData } from '@devographics/types'
import { Dispatch, SetStateAction } from 'react'
import { FormatValueType, Tick } from '../common2/types'
import {
    EditionWithPointData,
    EditionWithRank,
    VerticalBarChartValues,
    VerticalBarViewDefinition
} from '../verticalBar2/types'
import { LegendItem } from './Legend-old'

export type MultiRatioSerie = DataSeries<StandardQuestionData[]>

export enum Ratios {
    USAGE = 'usage',
    AWARENESS = 'awareness',
    INTEREST = 'interest',
    RETENTION = 'retention',
    POSITIVITY = 'positivity',
    RELATIVE_POSITIVITY = 'positivityRelative'
}

export enum Modes {
    VALUE = 'value',
    RANK = 'rank'
}

export type MultiRatiosChartState = {
    view: Ratios
    setView: Dispatch<SetStateAction<Ratios>>
    mode: Modes
    setMode: Dispatch<SetStateAction<Modes>>
    viewDefinition: VerticalBarViewDefinition
    highlighted: string | null
    setHighlighted: Dispatch<SetStateAction<string | null>>
}

export type MultiRatiosChartValues = VerticalBarChartValues & { legendItems: LegendItem[] }

export type EditionWithRank = EditionWithPointData & {
    rank: number
}
