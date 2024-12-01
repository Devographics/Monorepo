import { DataSeries } from 'core/filters/types'
import { QuestionMetadata, ResponseEditionData, StandardQuestionData } from '@devographics/types'
import { Dispatch, SetStateAction } from 'react'
import { FormatValueType, Tick } from '../common2/types'
import { EditionWithRank, VerticalBarChartValues } from '../verticalBar2/types'
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

export type MultiRatiosViewDefinition = {
    getEditionValue?: (edition: EditionWithRank, chartState: MultiRatiosChartState) => number
    formatValue: FormatValueType
    invertYAxis?: boolean
}

export type MultiRatiosChartState = {
    view: Ratios
    setView: Dispatch<SetStateAction<Ratios>>
    mode: Modes
    setMode: Dispatch<SetStateAction<Modes>>
    viewDefinition: MultiRatiosViewDefinition
    highlighted: string | null
    setHighlighted: Dispatch<SetStateAction<string | null>>
}

export type MultiRatiosChartValues = VerticalBarChartValues & { legendItems: LegendItem[] }
