import React from 'react'
import { useI18n } from '@devographics/react-i18n'
import { BoxProps, STROKE_WIDTH } from './Percentiles'
import { Dot, DotProps, ValueLabel } from './Dot'
import { InsufficientData } from './InsufficientData'

export const AverageBox = ({
    stroke,
    contentWidth,
    bucket,
    rowHeight,
    labelFormatter,
    xScale,
    isReversed
}: BoxProps) => {
    const { getString } = useI18n()

    const average = bucket.averageByFacet || 0

    const dotProps = {
        stroke,
        strokeWidth: STROKE_WIDTH,
        rowHeight,
        labelFormatter,
        xScale
    }

    const xCoord = xScale(average)

    const valueLabel = getString('charts.average_value', {
        values: { value: labelFormatter(average) }
    })?.t

    return bucket.hasInsufficientData ? (
        <g>
            <InsufficientData width={`${contentWidth}px`} y={rowHeight / 2 + 3}>
                {getString('charts.insufficient_data')?.t}
            </InsufficientData>
        </g>
    ) : (
        <>
            {/* <AverageDot value={average} xCoord={xCoord} {...dotProps} /> */}
            <ValueLabel
                xCoord={xCoord}
                stroke={stroke}
                value={average}
                labelFormatter={labelFormatter}
                rowHeight={rowHeight}
                label={valueLabel}
            />
        </>
    )
}

export const AverageDot = ({
    value,
    stroke,
    strokeWidth,
    rowHeight,
    labelFormatter,
    xCoord
}: DotProps & {
    value: number
    labelFormatter: BoxProps['labelFormatter']
    xCoord: number
}) => {
    const { getString } = useI18n()

    const valueLabel = labelFormatter(value)
    const label = getString('charts.average_value', {
        values: { value: valueLabel }
    })?.t

    return (
        <Dot
            xCoord={xCoord}
            rowHeight={rowHeight}
            stroke={stroke}
            strokeWidth={strokeWidth}
            label={label}
        />
    )
}
