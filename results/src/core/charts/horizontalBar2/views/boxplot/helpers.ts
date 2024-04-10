import * as d3 from 'd3'
import { Bucket } from '@devographics/types'

export const useScales = ({
    chartMax,
    contentWidth,
    contentHeight,
    groups
}: {
    chartMax: number
    contentWidth: number
    contentHeight: number
    groups: string[]
}) => {
    const xScale = d3.scaleLinear().domain([0, chartMax]).range([0, contentWidth])
    const yScale = d3.scaleBand().range([0, contentHeight]).domain(groups).padding(0.25)
    return { xScale, yScale }
}

export const useBoxplotData = ({
    bucket,
    xScale,
    yScale
}: {
    bucket: Bucket
    xScale: d3.ScaleLinear<number, number, never>
    yScale: d3.ScaleBand<string>
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
