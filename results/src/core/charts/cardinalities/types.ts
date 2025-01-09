import { FeaturesOptions } from '@devographics/types'
import { ChartStateWithView } from '../common2/types'
import { HorizontalBarViewDefinition } from '../horizontalBar2/types'

export type CardinalitiesChartState = ChartStateWithView<FeaturesOptions>

export type CardinalitiesViewDefinition = HorizontalBarViewDefinition<CardinalitiesChartState>
