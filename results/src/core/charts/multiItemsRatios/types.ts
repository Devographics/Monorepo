import { DataSeries } from 'core/filters/types'
import { QuestionMetadata, ResponseEditionData, StandardQuestionData } from '@devographics/types'
import { Dispatch, SetStateAction } from 'react'
import { FormatValueType, Tick } from '../common2/types'
import { VerticalBarChartValues } from '../verticalBar2/types'

export type MultiRatioSerie = DataSeries<StandardQuestionData[]>

export enum Ratios {
    AWARENESS = 'awareness',
    USAGE = 'usage',
    INTEREST = 'interest',
    RETENTION = 'retention',
    POSITIVITY = 'positivity'
}

export type MultiRatiosViewDefinition = {
    getEditionValue?: (edition: ResponseEditionData, chartState: MultiRatiosChartState) => number
    formatValue: FormatValueType
}

export type MultiRatiosChartState = {
    view: Ratios
    setView: Dispatch<SetStateAction<Ratios>>
    viewDefinition: MultiRatiosViewDefinition
    highlighted: string | null
    setHighlighted: Dispatch<SetStateAction<string | null>>
}

export type MultiRatiosChartValues = VerticalBarChartValues
