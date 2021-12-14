import React, { memo, ReactNode } from 'react'
import styled from 'styled-components'
import { mq, spacing } from 'core/theme'

type PositionProp = 'top' | 'right' | 'bottom' | 'left'

interface IndicatorProps {
    position: PositionProp
}

interface ChartContainerProps {
    children: ReactNode
    height?: string | number
    className?: string
    fit?: boolean
    vscroll?: boolean
}

const Indicator = memo(({ position }: IndicatorProps) => (
    <ChartContainerIndicator
        position={position}
        className={`ChartContainerIndicator ChartContainerIndicator--${position}`}
    >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="100" viewBox="0 0 30 100">
            <g id="Outline_Icons">
                <line
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeMiterlimit="10"
                    strokeWidth="8"
                    x1="30"
                    y1="0"
                    x2="0"
                    y2="50"
                />
                <line
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeMiterlimit="10"
                    strokeWidth="8"
                    x1="0"
                    y1="50"
                    x2="30"
                    y2="100"
                />
            </g>
        </svg>
    </ChartContainerIndicator>
))
Indicator.displayName = 'Indicator'

/**
 * - Fit: fit to viewport width
 * - Expand: force a 600px width
 */
const ChartContainer = ({
    children,
    height,
    fit = false,
    className = '',
    vscroll = false
}: ChartContainerProps) => (
    <ChartContainerOuter className={`ChartContainerOuter ${className}`} style={{ height }}>
        <Container className="ChartContainer" style={{ height }}>
            <ChartContainerInner
                className={`ChartContainerInner${!fit ? ' ChartContainerInner--expand' : ''}`}
                style={{ height }}
            >
                {children}
            </ChartContainerInner>
        </Container>
        {!fit && (
            <>
                <Indicator position="left" />
                <Indicator position="right" />
                {vscroll && (
                    <>
                        <Indicator position="top" />
                        <Indicator position="bottom" />
                    </>
                )}
            </>
        )}
    </ChartContainerOuter>
)

const ChartContainerOuter = styled.div`
    position: relative;
`

const Container = styled.div`
    svg {
        display: block;
    }

    @media ${mq.smallMedium} {
        overflow-x: scroll;
    }

    .FeatureExperienceBlock__RowChart & {
        @media ${mq.smallMedium} {
            overflow-x: visible;
        }
    }
`

const ChartContainerInner = styled.div`
    &.ChartContainerInner--expand {
        @media ${mq.small} {
            min-width: 500px;
        }
        @media ${mq.medium} {
            max-width: auto;
            min-width: 800px;
            padding-bottom: ${spacing(1)};
        }
    }
`

const ChartContainerIndicator = styled.span<IndicatorProps>`
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;

    svg {
        display: block;
        stroke: ${({ theme }) => theme.colors.link};
        opacity: 0.5;
        overflow: visible;
    }

    &.ChartContainerIndicator--left,
    &.ChartContainerIndicator--right {
        top: 0;
        bottom: 0;
        width: 20px;
    }
    &.ChartContainerIndicator--left {
        left: 10px;
    }
    &.ChartContainerIndicator--right {
        right: 10px;
        transform: rotate(180deg);
    }
    &.ChartContainerIndicator--top,
    &.ChartContainerIndicator--bottom {
        left: 0;
        right: 0;
        height: 20px;
    }
    &.ChartContainerIndicator--top {
        top: 10px;
        transform: rotate(90deg);
    }
    &.ChartContainerIndicator--bottom {
        bottom: 10px;
        transform: rotate(-90deg);
    }

    @media ${mq.mediumLarge} {
        display: none;
    }
`

export default ChartContainer
