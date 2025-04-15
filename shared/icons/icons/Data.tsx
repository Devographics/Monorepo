import React from 'react'
import IconWrapper, { IconProps } from './IconWrapper'

export const DataIcon = (props: IconProps) => (
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
        >
            <path d="M3 3h18v18H3zM21 9H3M21 15H3M12 3v18" />
        </svg>
    </IconWrapper>
)
