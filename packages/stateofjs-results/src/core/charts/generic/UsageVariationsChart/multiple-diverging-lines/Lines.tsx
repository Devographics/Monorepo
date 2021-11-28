import React from 'react'
import { Area, Line as D3Line } from 'd3-shape'
import { animated } from 'react-spring'
import { useAnimatedPath } from '@nivo/core'
import { ComputedDatum, ComputedPoint } from './types'
import { NegativePattern } from './NegativePattern'

interface LineProps {
    data: ComputedDatum
    lineGenerator: D3Line<ComputedPoint>
    areaGenerator: Area<ComputedPoint>
    itemHeight: number
    width: number
}

const Line = ({ data, lineGenerator, areaGenerator, itemHeight, width }: LineProps) => {
    const linePath = lineGenerator(data.data)
    const animatedLinePath = useAnimatedPath(linePath as string)

    const areaPath = areaGenerator(data.data)
    const animatedAreaPath = useAnimatedPath(areaPath as string)

    const positiveMaskId = `${data.id}-positiveMask`
    const negativeMaskId = `${data.id}-negativeMask`
    const negativePatternId = `${data.id}-negativePattern`

    return (
        <>
            <defs>
                <mask id={positiveMaskId}>
                    <rect y={-itemHeight} width={width} height={itemHeight} fill="#ffffff" />
                </mask>
                <mask id={negativeMaskId}>
                    <rect width={width} height={itemHeight} fill="#ffffff" />
                </mask>
                <NegativePattern id={negativePatternId} color={data.color} />
            </defs>
            <animated.path
                mask={`url(#${positiveMaskId})`}
                d={animatedAreaPath}
                fill={data.color}
                opacity={0.4}
            />
            <animated.path
                mask={`url(#${negativeMaskId})`}
                d={animatedAreaPath}
                fill={`url(#${negativePatternId})`}
                opacity={0.4}
            />
            <animated.path d={animatedLinePath} fill="none" stroke={data.color} strokeWidth={2} />
        </>
    )
}

interface LinesProps {
    data: ComputedDatum[]
    lineGenerator: D3Line<ComputedPoint>
    areaGenerator: Area<ComputedPoint>
    itemHeight: number
    width: number
}

export const Lines = ({ data, lineGenerator, areaGenerator, itemHeight, width }: LinesProps) => {
    return (
        <g>
            {data.map((datum) => {
                return (
                    <g
                        key={datum.id}
                        transform={`translate(0, ${datum.index * itemHeight + itemHeight * 0.5})`}
                    >
                        <Line
                            data={datum}
                            lineGenerator={lineGenerator}
                            areaGenerator={areaGenerator}
                            itemHeight={itemHeight}
                            width={width}
                        />
                    </g>
                )
            })}
        </g>
    )
}
