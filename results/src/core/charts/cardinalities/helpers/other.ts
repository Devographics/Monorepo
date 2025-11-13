import { StandardQuestionData } from '@devographics/types'
import { DataSeries } from 'core/filters/types'
import { HorizontalBarViewDefinition } from '../../horizontalBar2/types'
import { SeriesMetadata } from 'core/charts/common2/types'
import { CardinalitiesChartState } from '../types'
import { BlockVariantDefinition } from 'core/types'
import max from 'lodash/max'

export const getSerieBuckets = ({
    serie,
    chartState
}: {
    serie: DataSeries<StandardQuestionData[]>
    chartState: CardinalitiesChartState
}) => {
    const { view } = chartState
    const item = serie.data.find(item => item.id === view)
    if (!item) {
        throw new Error(`cardinalities/getSerieBuckets: could not find item for view ${view}`)
    }
    const buckets = item.responses.allEditions[0].buckets
    return buckets
}

/*

Calculate metadata about all series (in the cases where we're showing multiple)

(note: just max value between all series for now)

*/
export const getSeriesMetadata = ({
    series,
    block,
    chartState,
    viewDefinition
}: {
    series: DataSeries<StandardQuestionData[]>[]
    block: BlockVariantDefinition
    chartState: CardinalitiesChartState
    viewDefinition: HorizontalBarViewDefinition<CardinalitiesChartState>
}) => {
    const { getValue } = viewDefinition
    const allSeriesValues = series
        .map(serie => {
            const buckets = getSerieBuckets({ serie, chartState })
            const values = buckets.map(getValue)
            return values
        })
        .flat()
    const seriesMaxValue = max(allSeriesValues) || 0
    const metadata: SeriesMetadata = { seriesMaxValue }
    return metadata
}
