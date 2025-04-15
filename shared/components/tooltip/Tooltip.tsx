import React from 'react'
import styled, { css } from 'styled-components'
import * as RadixTooltip from '@radix-ui/react-tooltip'

export const getTooltipContent = (element: any) => styled(element)`
    background: var(--backgroundBackgroundColor);
    font-size: 0.8rem;
    padding: 6px 12px;
    border: 1px solid var(--borderColor);
    z-index: 10000;
    p:last-child {
        margin: 0;
    }
    // see https://www.joshwcomeau.com/css/designing-shadows/
    /* filter: drop-shadow(1px 2px 8px hsl(220deg 60% 50% / 0.3))
    drop-shadow(2px 4px 16px hsl(220deg 60% 50% / 0.3))
    drop-shadow(4px 8px 32px hsl(220deg 60% 50% / 0.3)); */
`

export const TooltipContent_ = getTooltipContent(RadixTooltip.Content)

const Trigger = styled(RadixTooltip.Trigger)`
    /* background: none;
    border: none;
    padding: 0;
    display: inline-block; */

    ${props => {
        if (props.$clickable) {
            return css`
                cursor: pointer;
            `
        }
    }}
`

// const Arrow = styled(RadixTooltip.Arrow)`
//     fill: ${props => props.theme.colors.backgroundBackground};
//     stroke: ${props => props.theme.colors.text};
//     stroke-width: 2px;
// `

export const Tooltip = ({
    trigger,
    contents,
    asChild = true,
    clickable = false,
    showBorder = true
}: {
    trigger: React.ReactNode
    contents: React.ReactNode
    asChild?: boolean
    clickable?: boolean
    showBorder?: boolean
}) => (
    <RadixTooltip.Provider>
        <RadixTooltip.Root delayDuration={100}>
            <Trigger
                className={`tooltip-trigger ${showBorder ? 'tooltip-trigger-withBorder' : ''}`}
                asChild={asChild}
                $clickable={clickable}
            >
                {trigger}
            </Trigger>
            <RadixTooltip.Portal>
                <TooltipContent_ side="top">
                    {contents}
                    {/* <Arrow /> */}
                </TooltipContent_>
            </RadixTooltip.Portal>
        </RadixTooltip.Root>
    </RadixTooltip.Provider>
)

export default Tooltip
