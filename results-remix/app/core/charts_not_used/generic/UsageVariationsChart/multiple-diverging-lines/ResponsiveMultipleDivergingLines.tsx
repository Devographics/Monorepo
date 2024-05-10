import React from 'react'
import { ResponsiveWrapper } from '@nivo/core'
import { MultipleDivergingLines, MultipleDivergingLinesSvgProps } from './MultipleDivergingLines'

export const ResponsiveMultipleDivergingLines = (
    props: Omit<MultipleDivergingLinesSvgProps, 'width' | 'height'>
) => (
    <ResponsiveWrapper>
        {({ width, height }: { width: number; height: number }) => (
            <MultipleDivergingLines width={width} height={height} {...props} />
        )}
    </ResponsiveWrapper>
)
