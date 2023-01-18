import React from 'react'
import styled, { useTheme } from 'styled-components'
import * as Popover from '@radix-ui/react-popover'
import { CloseIcon } from 'core/icons'

const PopoverComponent = ({ trigger, children }) => {
    return (
        <Popover.Root>
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
    width: 260px;
    background-color: white;
    box-shadow: hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px;
    animation-duration: 400ms;
    animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
    will-change: transform, opacity;

    &:focus {
        box-shadow: hsl(206 22% 7% / 35%) 0px 10px 38px -10px,
            hsl(206 22% 7% / 20%) 0px 10px 20px -15px, 0 0 0 2px var(--violet7);
    }
`

const PopoverArrow_ = styled(Popover.Arrow)`
    fill: white;
`

const PopoverClose_ = styled(Popover.Close)`
    font-family: inherit;
    border-radius: 100%;
    height: 25px;
    width: 25px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--violet11);
    position: absolute;
    top: 5px;
    right: 5px;

    &:hover {
        background-color: var(--violet4);
    }
    &:focus {
        box-shadow: 0 0 0 2px var(--violet7);
    }
`

export default PopoverComponent
