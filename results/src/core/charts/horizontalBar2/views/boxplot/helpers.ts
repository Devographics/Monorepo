import * as d3 from 'd3'
import { Bucket } from '@devographics/types'
import { SeriesMetadata } from 'core/charts/common2/types'

// use a value slightly larger than max to leave margin for labels, etc. on right side of chart
const MAX_COEFF = 1.2

// Compute everything derived from the dataset:
export const getDatasetValues = ({
    buckets,
    seriesMetadata
}: {
    buckets: Bucket[]
    seriesMetadata: SeriesMetadata
}) => {
    // const [chartMin, chartMax] = d3.extent(data.map(d => d.value)) as [number, number]
    const allP10 = buckets.map(bucket => bucket.percentilesByFacet?.p10 || 0)

    const allP90 = buckets.map(bucket => bucket.percentilesByFacet?.p90 || 0)
    // to ensure all series have same scale, use global series max if available
    const p90Max = seriesMetadata.seriesMaxValue || Math.max(...allP90)
    const [chartMin, chartMax] = [Math.min(...allP10), p90Max]
    const groups = [...new Set(buckets.map(bucket => bucket.id))]
    return { chartMin, chartMax: chartMax * MAX_COEFF, groups }
}

export const useXScale = ({
    chartMax,
    contentWidth
}: {
    chartMax: number
    contentWidth: number
}) => {
    return d3.scaleLinear().domain([0, chartMax]).range([0, contentWidth])
}

export const useYScale = ({
    contentHeight,
    groups
}: {
    contentHeight: number
    groups: string[]
}) => {
    return d3.scaleBand().range([0, contentHeight]).domain(groups).padding(0.25)
}

const PIXEL_PER_TICKS = 100

export const useTicks = (xScale: d3.ScaleLinear<number, number, never>) => {
    const range = xScale.range()

    const width = range[1] - range[0]
    const numberOfTicksTarget = Math.floor(width / PIXEL_PER_TICKS)
    return xScale.ticks(numberOfTicksTarget).map(value => ({
        value,
        xOffset: xScale(value)
    }))
}
export const useBoxplotData = ({
    bucket,
    xScale,
    yScale,
    isReversed = false
}: {
    bucket: Bucket
    xScale: d3.ScaleLinear<number, number, never>
    yScale: d3.ScaleBand<string>
    isReversed?: boolean
}) => {
    if (!bucket.percentilesByFacet) {
        return
    }
    const { p0, p10, p25, p50, p75, p90, p100 } = bucket.percentilesByFacet

    const boxData = {
        p0: xScale(p0),
        p10: xScale(p10),
        p25: xScale(p25),
        p50: xScale(p50),
        p75: xScale(p75),
        p90: xScale(p90),
        p100: xScale(p100)
    }
    return boxData
}
