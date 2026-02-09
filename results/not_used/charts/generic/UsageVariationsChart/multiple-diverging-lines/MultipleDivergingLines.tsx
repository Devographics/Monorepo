import React from 'react'
import { Container, Margin, useDimensions, Theme, ModernMotionProps } from '@nivo/core'
import { Grid, Axes, AxisProps } from '@nivo/axes'
import { OrdinalColorScaleConfig } from '@nivo/colors'
import { ComputedDatum, Datum } from './types'
import { defaultProps } from './props'
import { useComputedData, useScales, useShapeGenerators } from './hooks'
import { Legend } from './Legend'
import { SubAxes } from './SubAxes'
import { Labels } from './Labels'
import { Lines } from './Lines'
import { Dots } from './Dots'

export interface MultipleDivergingLinesSvgProps extends ModernMotionProps {
    width: number
    height: number
    margin?: Partial<Margin>

    data: Datum[]
    keys: string[]

    i18nNamespace: string

    axisTop?: AxisProps
    axisBottom?: AxisProps
    enableGridX?: boolean

    theme?: Theme
    colors?: OrdinalColorScaleConfig<Omit<ComputedDatum, 'color'>>

    isInteractive?: boolean
}

const InnerMultipleDivergingLines = ({
    width,
    height,
    margin: partialMargin,
    data,
    keys,
    axisTop,
    axisBottom,
    colors = defaultProps.colors,
    i18nNamespace,
}: MultipleDivergingLinesSvgProps) => {
    const { outerWidth, outerHeight, margin, innerWidth, innerHeight } = useDimensions(
        width,
        height,
        partialMargin
    )
    const itemHeight = innerHeight / data.length
    const { indexScale, valueScale } = useScales({
        data,
        keys,
        itemHeight,
        width: innerWidth,
    })
    const computedData = useComputedData({ data, indexScale, valueScale, colors })

    const { lineGenerator, areaGenerator } = useShapeGenerators()

    return (
        <svg width={outerWidth} height={outerHeight} style={{ background: 'rgba(0, 0, 0, 0)' }}>
            <g transform={`translate(${margin.left}, ${margin.top})`}>
                <g transform={`translate(${innerWidth / 2}, -110)`}>
                    <Legend size={50} />
                </g>
                <Grid xScale={indexScale as any} width={innerWidth} height={innerHeight} />
                <Axes
                    xScale={indexScale as any}
                    width={innerWidth}
                    height={innerHeight}
                    top={axisTop}
                    bottom={axisBottom}
                />
                <SubAxes
                    data={computedData}
                    valueScale={valueScale}
                    itemHeight={itemHeight}
                    width={innerWidth}
                />
                <Labels
                    data={computedData}
                    itemHeight={itemHeight}
                    width={innerWidth}
                    margin={margin}
                />
                <Lines
                    data={computedData}
                    lineGenerator={lineGenerator}
                    areaGenerator={areaGenerator}
                    itemHeight={itemHeight}
                    width={innerWidth}
                />
                <Dots data={computedData} itemHeight={itemHeight} i18nNamespace={i18nNamespace} />
            </g>
        </svg>
    )
}

export const MultipleDivergingLines = ({
    isInteractive = defaultProps.isInteractive,
    animate = defaultProps.animate,
    motionConfig = defaultProps.motionConfig,
    ...otherProps
}: MultipleDivergingLinesSvgProps) => {
    return (
        <Container
            theme={otherProps.theme}
            isInteractive={isInteractive}
            animate={animate}
            motionConfig={motionConfig}
        >
            <InnerMultipleDivergingLines
                isInteractive={isInteractive}
                animate={animate}
                motionConfig={motionConfig}
                {...otherProps}
            />
        </Container>
    )
}
