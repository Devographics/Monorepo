import React from 'react'
const STROKE_WIDTH = 1

// A reusable component that builds a vertical box shape using svg
// Note: numbers here are px, not the real values in the dataset.

type VerticalBoxProps = {
    p0: number
    p25: number
    p50: number
    p75: number
    p100: number
    width: number
    stroke: string
    fill: string
}

export const VerticalBox = ({ p0, p25, p50, p75, p100, width, stroke, fill }: VerticalBoxProps) => {
    return (
        <>
            <line
                x1={width / 2}
                x2={width / 2}
                y1={p0}
                y2={p100}
                stroke={stroke}
                strokeWidth={STROKE_WIDTH}
            />
            <rect
                x={0}
                y={p75}
                width={width}
                height={p25 - p75}
                stroke={stroke}
                // fill={fill}
                fill="url(#VelocityVertical2)"
            />
            <line
                x1={width / 3}
                x2={(2 * width) / 3}
                y1={p0}
                y2={p0}
                stroke={stroke}
                strokeWidth={STROKE_WIDTH}
            />
            <line
                x1={width / 3}
                x2={(2 * width) / 3}
                y1={p100}
                y2={p100}
                stroke={stroke}
                strokeWidth={STROKE_WIDTH}
            />
            <line
                x1={0}
                x2={width}
                y1={p50}
                y2={p50}
                stroke={stroke}
                strokeWidth={STROKE_WIDTH * 3}
            />
        </>
    )
}
