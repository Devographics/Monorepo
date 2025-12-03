import React from 'react'
import IconWrapper, { IconProps } from './IconWrapper'

export const ChevronUpIcon = (props: IconProps) => (
    <IconWrapper {...props}>
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="butt"
            strokeLinejoin="round"
        >
            <path d="m18 15-6-6-6 6"></path>
        </svg>
    </IconWrapper>
)
