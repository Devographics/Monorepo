import React from 'react'
import IconWrapper, { IconProps } from './IconWrapper'

export const CheckIcon = (props: IconProps) => (
    <IconWrapper {...props}>
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="butt"
            strokeLinejoin="round"
            className="icon-check"
        >
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
    </IconWrapper>
)
