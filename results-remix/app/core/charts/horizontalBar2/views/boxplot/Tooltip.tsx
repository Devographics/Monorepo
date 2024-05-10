import styled from 'styled-components'
import { fontSize, spacing } from 'core/theme'
import React from 'react'
import { Tooltip } from 'react-svg-tooltip'

const TOOLTIP_OFFSET = 2
const TOOLTIP_WIDTH = 600
const TOOLTIP_HEIGHT = 250

export function TooltipItem({
    triggerRef,
    label,
    direction = 'right'
}: {
    triggerRef: React.RefObject<SVGElement>
    label: string
    direction?: 'left' | 'right'
}) {
    let x = TOOLTIP_OFFSET
    const y = TOOLTIP_OFFSET
    if (direction === 'left') {
        x = x - TOOLTIP_WIDTH
    }
    return (
        <Tooltip triggerRef={triggerRef}>
            <foreignObject x={x} y={y} width={TOOLTIP_WIDTH} height={TOOLTIP_HEIGHT}>
                <TooltipWrapper_
                    style={{ justifyContent: direction === 'right' ? 'flex-start' : 'flex-end' }}
                >
                    <TooltipContent_>{label}</TooltipContent_>
                </TooltipWrapper_>
            </foreignObject>
        </Tooltip>
    )
}

const TooltipWrapper_ = styled.div`
    display: flex;
`

const TooltipContent_ = styled.div`
    background: ${props => props.theme.colors.backgroundBackground};
    font-size: ${fontSize('small')};
    padding: ${spacing(0.3)} ${spacing(0.6)};
    border: 1px solid ${props => props.theme.colors.border};
    z-index: 10000;
    width: min-content;
    white-space: nowrap;
    p:last-child {
        margin: 0;
    }
    // see https://www.joshwcomeau.com/css/designing-shadows/
    /* filter: drop-shadow(1px 2px 8px hsl(220deg 60% 50% / 0.3))
    drop-shadow(2px 4px 16px hsl(220deg 60% 50% / 0.3))
    drop-shadow(4px 8px 32px hsl(220deg 60% 50% / 0.3)); */
`
