import React from 'react'
import { Tooltip } from 'react-svg-tooltip'
import './Tooltip.scss'

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
                <div
                    className="boxplot-tooltip-wrapper"
                    style={{ justifyContent: direction === 'right' ? 'flex-start' : 'flex-end' }}
                >
                    <div className="boxplot-tooltip-content">{label}</div>
                </div>
            </foreignObject>
        </Tooltip>
    )
}
