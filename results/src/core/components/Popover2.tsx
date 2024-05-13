import React from 'react'
import styled from 'styled-components'
import * as Popover from '@radix-ui/react-popover'
import { CloseIcon } from 'core/icons'

const PopoverComponent = ({
    trigger,
    children
}: {
    trigger: React.ReactNode
    children: React.ReactNode
}) => {
    return (
        <Popover.Root>
            {/** @ts-expect-error TODO: Radix-ui seems to indicate that this is actually valid, not sure why it raises an error */}
            <Popover.Trigger asChild>{trigger}</Popover.Trigger>
            <Popover.Portal>
                <PopoverContent_ className="PopoverContent" sideOffset={5}>
                    {children}
                    <PopoverClose_ className="PopoverClose" aria-label="Close">
                        <CloseIcon />
                    </PopoverClose_>
                    <PopoverArrow_ className="PopoverArrow" />
                </PopoverContent_>
            </Popover.Portal>
        </Popover.Root>
    )
}

const PopoverContent_ = styled(Popover.Content)`
    border-radius: 4px;
    padding: 20px;
    min-width: 260px;
    max-width: min-content;
    background-color: ${({ theme }) => theme.colors.backgroundAlt};
    box-shadow: hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px;
    animation-duration: 400ms;
    animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
    will-change: transform, opacity;
    z-index: 10;
    position: relative;
    &:focus {
        box-shadow: hsl(206 22% 7% / 35%) 0px 10px 38px -10px,
            hsl(206 22% 7% / 20%) 0px 10px 20px -15px, 0 0 0 2px var(--violet7);
    }
`

const PopoverArrow_ = styled(Popover.Arrow)`
    fill: ${({ theme }) => theme.colors.backgroundAlt};
`

const PopoverClose_ = styled(Popover.Close)`
    position: absolute;
    top: 5px;
    right: 5px;
    background: none;
    border: none;
    stroke: ${({ theme }) => theme.colors.text};
`

export default PopoverComponent
