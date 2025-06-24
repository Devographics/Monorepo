import React from 'react'
import { useI18n } from '@devographics/react-i18n'
import { BoxProps, STROKE_WIDTH } from './Percentiles'
import { Dot, DotProps, InsufficientData_, ValueLabel } from './Dot'

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
            <InsufficientData_
                className="insufficient-data"
                width={`${contentWidth}px`}
                textAnchor="start"
                alignmentBaseline="middle"
                y={rowHeight / 2 + 3}
            >
                {getString('charts.insufficient_data')?.t}
            </InsufficientData_>
        </g>
    ) : (
        <>
            <AverageDot value={average} xCoord={xCoord} {...dotProps} />
            <ValueLabel
                xCoord={xCoord + 50}
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
