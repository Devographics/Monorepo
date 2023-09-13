import React from 'react'
import styled from 'styled-components'
import { BoxProps } from './VerticalBox'
const STROKE_WIDTH = 1

// A reusable component that builds a vertical box shape using svg
// Note: numbers here are px, not the real values in the dataset.

export const HorizontalBox = ({
    p0,
    p25,
    p50,
    p75,
    p100,
    height,
    stroke,
    fill,
    label
}: BoxProps & { height: number }) => {
    const labelWidth = label.length * 9
    const labelHeight = 24
    return (
        <>
            <line
                x1={p0}
                x2={p100}
                y1={height / 2}
                y2={height / 2}
                stroke={stroke}
                strokeWidth={STROKE_WIDTH}
            />
            {/* <rect
                x={p75}
                y={0}
                width={p25 - p75}
                height={height}
                stroke={stroke}
                // fill={fill}
                fill="url(#VelocityVertical2)"
            />
            <line
                x1={p0}
                x2={p0}
                y1={height / 3}
                y2={(2 * height) / 3}
                stroke={stroke}
                strokeWidth={STROKE_WIDTH}
            />
            <line
                x1={p100}
                x2={p100}
                y1={height / 3}
                y2={(2 * height) / 3}
                stroke={stroke}
                strokeWidth={STROKE_WIDTH}
            />
            <line
                x1={p50}
                x2={p50}
                y1={0}
                y2={height}
                stroke={stroke}
                strokeWidth={STROKE_WIDTH * 3}
            />
            <g transform={`translate(${p50}, ${height / 2})`}>
                <Background_
                    height={labelHeight}
                    width={labelWidth}
                    x={-labelWidth / 2}
                    y={-labelHeight / 2}
                    stroke={stroke}
                    rx={labelHeight / 2}
                    ry={labelHeight / 2}
                    fill="url(#VelocityVertical2)"
                    fill="#333"
                />
                <Text_
                    className="boxplot-chart-label"
                    stroke={stroke}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="11"
                >
                    {label}
                </Text_>
            </g> */}
        </>
    )
}

const Text_ = styled.text`
    cursor: default;
`

const Background_ = styled.rect``
