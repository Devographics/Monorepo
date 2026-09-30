import { CORRELATION_STRENGTH_BANDS } from '@devographics/constants'
import type React from 'react'
import { CorrelationItem, CorrelationStrength } from '@devographics/types'
import { getCorrelationKey } from './helpers'

// the axis always extends to at least ±0.5, and to the next multiple of this step beyond
export const EXTENT_STEP = 0.25

// a tick every TICK_STEP, labelled every LABEL_STEP (a multiple of TICK_STEP)
export const TICK_STEP = 0.05
export const LABEL_STEP = 0.25
export const MIN_EXTENT = 0.5

/*

Width of the bins nodes are grouped into, in correlation points. Bins start and
end on ticks and groups are drawn in the middle of their bin, so a group only
sits between two ticks if the step is an odd multiple of TICK_STEP (0.05, 0.15,
0.25…); an even multiple (0.1, 0.2…) puts every group on a tick.

*/
export const DEFAULT_GROUP_STEP = TICK_STEP

export type SpectrumNode = {
    correlation: CorrelationItem
    xPosition: number
}

export type SpectrumGroup = {
    id: string
    // bin number: the group covers [bin * step, (bin + 1) * step)
    bin: number
    // middle of the bin, where the group is drawn
    center: number
    xPosition: number
    // strongest first
    nodes: SpectrumNode[]
}

export type SpectrumBand = {
    strength: CorrelationStrength
    // "neutral" is the weak band straddling 0
    direction: 'negative' | 'neutral' | 'positive'
    // correlation values, start < end
    start: number
    end: number
}

export type SpectrumStyle = React.CSSProperties & Record<`--${string}`, number>

/*

Ticks from one end of the axis to the other. Values are computed from an integer
count rather than by adding the step repeatedly, so floating point error can't
accumulate and make a tick miss a label boundary.

*/
export const getTicks = (extent: number) => {
    const count = Math.round((2 * extent) / TICK_STEP)
    return Array.from({ length: count + 1 }, (_, index) => {
        const value = Math.round((-extent + index * TICK_STEP) * 1000) / 1000
        const ratio = value / LABEL_STEP
        return { value, isLabelled: Math.abs(ratio - Math.round(ratio)) < 1e-9 }
    })
} /*

The strength bands laid out along the axis, left to right: very strong,
strong, moderate, weak (straddling 0), then the same again mirrored. Thresholds
come from the same shared constant the API uses to label correlations, so a band
always matches the labels on the cards. Bands are cut off at the axis extent,
and a band lying entirely beyond it is left out.

*/

export const getSpectrumBands = (extent: number): SpectrumBand[] => {
    // weakest threshold first: moderate, strong, very strong
    const thresholds = [...CORRELATION_STRENGTH_BANDS].reverse()
    const positive: SpectrumBand[] = thresholds
        .map(([strength, lowerBound], index) => ({
            strength,
            direction: 'positive' as const,
            start: lowerBound,
            end: Math.min(thresholds[index + 1]?.[1] ?? extent, extent)
        }))
        .filter(band => band.start < extent)
    const weakBound = Math.min(thresholds[0][1], extent)
    const weak: SpectrumBand = {
        strength: 'weak',
        direction: 'neutral',
        start: -weakBound,
        end: weakBound
    }
    const negative = [...positive].reverse().map(band => ({
        ...band,
        direction: 'negative' as const,
        start: -band.end,
        end: -band.start
    }))
    return [...negative, weak, ...positive]
}

/*

Which bin a correlation falls in. Bins are measured out from 0 on both sides,
so a value and its opposite always land in mirror-image bins. A value sitting
exactly on an edge belongs to the bin further from 0, the same convention as the
strength bands (exactly 0.25 is "strong"), so a group never sits in a band below
its correlations' labels: with a step of 0.05, 0.64 falls in [0.60, 0.65) and is
drawn at 0.625, while 0.65 falls in [0.65, 0.70) and is drawn at 0.675. The ratio
is rounded before flooring so that floating point noise can't push an exact edge
into the bin below (0.3 / 0.05 = 5.999999999999999).

*/
export const getBin = (value: number, step: number) => {
    const ratio = Math.round((Math.abs(value) / step) * 1e6) / 1e6
    const magnitude = Math.floor(ratio)
    // negative bins are numbered so that `(bin + 0.5) * step` is still their middle
    return value < 0 ? -(magnitude + 1) : magnitude
}

export const getSpectrumGroups = (
    correlations: CorrelationItem[],
    extent: number,
    step: number = DEFAULT_GROUP_STEP
): SpectrumGroup[] => {
    const nodesByBin = new Map<number, SpectrumNode[]>()
    for (const correlation of correlations) {
        const bin = getBin(correlation.correlation, step)
        const node = { correlation, xPosition: getXPosition(correlation.correlation, extent) }
        nodesByBin.set(bin, [...(nodesByBin.get(bin) ?? []), node])
    }
    return [...nodesByBin.entries()]
        .sort(([a], [b]) => a - b)
        .map(([bin, nodes]) => {
            const center = Math.round((bin + 0.5) * step * 1000) / 1000
            const id = nodes.map(n => getCorrelationKey(n.correlation)).join('_____')
            return {
                id,
                bin,
                center,
                xPosition: getXPosition(center, extent),
                nodes: nodes.sort(
                    (a, b) =>
                        Math.abs(b.correlation.correlation) - Math.abs(a.correlation.correlation)
                )
            }
        })
}

// map a correlation within [-extent, extent] to a position within [0, 100]
export const getXPosition = (value: number, extent: number) =>
    Math.round(((value + extent) / (2 * extent)) * 1000) / 10

/*

Symmetric extent of the axis, rounded up to the next step, so that 0 always
sits in the middle and the strongest correlation stays close to an edge.

*/
export const getSpectrumExtent = (correlations: CorrelationItem[]) => {
    const max = Math.max(0, ...correlations.map(c => Math.abs(c.correlation)))
    return Math.max(MIN_EXTENT, Math.ceil(max / EXTENT_STEP) * EXTENT_STEP)
} /*

Where each strength band begins on either side of 0, as CSS variables named
after the band: `--moderatePositive` is where +0.15 sits, `--moderateNegative`
where -0.15 sits, and so on for every band in CORRELATION_STRENGTH_BANDS. A
threshold beyond the axis extent lands outside 0-100, which gradient stops
handle fine.

*/

export const getBandBoundaries = (extent: number) =>
    Object.fromEntries(
        CORRELATION_STRENGTH_BANDS.flatMap(([strength, lowerBound]) => {
            // very_strong -> veryStrong
            const name = strength.replace(/_(\w)/g, (_, letter: string) => letter.toUpperCase())
            return [
                [`--${name}Negative`, getXPosition(-lowerBound, extent)],
                [`--${name}Positive`, getXPosition(lowerBound, extent)]
            ]
        })
    ) as SpectrumStyle
