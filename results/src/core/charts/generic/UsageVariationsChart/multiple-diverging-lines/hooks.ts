import { useMemo } from 'react'
import { scaleLinear, scalePoint, ScalePoint, ScaleLinear } from 'd3-scale'
import { area as d3Area, curveMonotoneX, line as d3Line } from 'd3-shape'
import { OrdinalColorScaleConfig, useOrdinalColorScale } from '@nivo/colors'
import { ComputedDatum, ComputedPoint, Datum } from './types'

export const useScales = ({
    // data,
    keys,
    width,
    itemHeight,
}: {
    data: Datum[]
    keys: string[]
    width: number
    itemHeight: number
}) =>
    useMemo(() => {
        const absoluteMaxValue = 20
        /*
        const absoluteMaxValue = useMemo(() => {
            const allValues: number[] = []
            data.forEach((datum) => {
                datum.data.forEach((pointDatum) => {
                    allValues.push(pointDatum.value)
                })
            })

            const maxValue = Math.max(...allValues)
            const minValue = Math.min(...allValues)

            return Math.ceil(Math.max(Math.abs(minValue), maxValue))
        }, [data])
        */

        const indexScale = scalePoint().domain(keys).range([0, width])

        const valueScale = scaleLinear()
            .domain([-absoluteMaxValue, absoluteMaxValue])
            .range([itemHeight / 2, -itemHeight / 2])

        return {
            indexScale,
            valueScale,
        }
    }, [keys, width, itemHeight])

export const useShapeGenerators = () =>
    useMemo(() => {
        const lineGenerator = d3Line<ComputedPoint>()
            .x((d) => d.x)
            .y((d) => d.y)
            .curve(curveMonotoneX)

        const areaGenerator = d3Area<ComputedPoint>()
            .x((d) => d.x)
            .y0(0)
            .y1((d) => d.y)
            .curve(curveMonotoneX)

        return {
            lineGenerator,
            areaGenerator,
        }
    }, [])

export const useComputedData = ({
    data,
    indexScale,
    valueScale,
    colors,
}: {
    data: Datum[]
    indexScale: ScalePoint<string>
    valueScale: ScaleLinear<number, number>
    colors: OrdinalColorScaleConfig<Omit<ComputedDatum, 'color'>>
}) => {
    const getColor = useOrdinalColorScale<Omit<ComputedDatum, 'color'>>(colors, 'id')

    return useMemo(() => {
        return data.map((datum, index) => {
            const computedDatum: Omit<ComputedDatum, 'color'> = {
                ...datum,
                index,
                data: datum.data.map((pointDatum) => {
                    return {
                        x: indexScale(pointDatum.index) as number,
                        y: valueScale(pointDatum.percentageDelta) as number,
                        data: pointDatum,
                    }
                }),
            }

            return {
                ...computedDatum,
                color: getColor(computedDatum),
            } as ComputedDatum
        })
    }, [data, indexScale, valueScale, getColor])
}
