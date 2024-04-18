import React from 'react'
import { PatternLines } from '@nivo/core'

interface NegativePatternProps {
    id: string
    color: string
}

export const NegativePattern = ({ id, color }: NegativePatternProps) => (
    <PatternLines
        id={id}
        rotation={-45}
        lineWidth={4}
        spacing={8}
        background="transparent"
        color={color}
    />
)
